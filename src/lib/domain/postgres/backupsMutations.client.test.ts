import type { ComponentProps } from 'svelte';
import type { AfterNavigate } from '@sveltejs/kit';
import { flushSync, mount, unmount } from 'svelte';
import { readable, writable } from 'svelte/store';
import BackupsPage from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/backups/+page.svelte';
import TeamPostgresPage from '../../../routes/team/[team]/postgres/+page.svelte';

const { afterNavigate, goto, mutate, page } = vi.hoisted(() => ({
	afterNavigate: vi.fn<(callback: (navigation: AfterNavigate) => void) => void>(),
	goto: vi.fn(),
	mutate: vi.fn(),
	page: {
		data: { tenantName: 'nav' },
		params: { team: 'test', env: 'dev', postgres: 'database' },
		url: new URL('https://console.test/team/test/dev/postgres/database/backups')
	}
}));

vi.mock('$app/navigation', () => ({ afterNavigate, goto }));
vi.mock('$app/state', () => ({ page }));
vi.mock('$houdini', () => ({ graphql: () => ({ mutate }) }));

const backup = {
	id: 'backup-id',
	name: 'snapshot',
	sourcePostgres: 'database',
	phase: 'COMPLETED',
	retentionDays: 30,
	majorVersion: null,
	diskSize: null,
	extensions: [],
	sizeBytes: null,
	createdAt: new Date('2026-11-25T10:47:22Z'),
	expiresAt: null,
	errorMessage: null,
	teamEnvironment: { environment: { name: 'dev' } }
};

const params = page.params;
const pageInfo = { totalCount: 1, hasNextPage: false, hasPreviousPage: false };
const postgresBackups = { nodes: [backup], pageInfo };
const requestedBackup = {
	...backup,
	name: 'requested-backup',
	createdAt: new Date('2026-11-25T10:48:22Z')
};
let cleanup: (() => Promise<void>) | undefined;

beforeEach(() => {
	page.params.team = 'test';
	page.url = new URL('https://console.test/team/test/dev/postgres/database/backups');
	vi.stubGlobal('matchMedia', () => ({
		matches: false,
		addEventListener: vi.fn(),
		removeEventListener: vi.fn()
	}));
});

afterEach(async () => {
	await cleanup?.();
	cleanup = undefined;
	document.body.replaceChildren();
	vi.useRealTimers();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.resetAllMocks();
});

function databaseSnapshot(nodes = [backup]) {
	return {
		data: { team: { environment: { postgres: null }, postgresBackups: { nodes, pageInfo } } },
		errors: null,
		fetching: false
	};
}

function mountPage(
	view: 'database' | 'team',
	fetch: ReturnType<typeof vi.fn>,
	databaseStore = readable(databaseSnapshot())
) {
	const permissions = { viewerIsMember: true, isAdmin: false };
	if (view === 'database') {
		const component = mount(BackupsPage, {
			target: document.body,
			props: {
				params,
				data: {
					...permissions,
					get teamSlug() {
						return page.params.team;
					},
					PostgresBackups: {
						...databaseStore,
						fetch
					}
				} as unknown as ComponentProps<typeof BackupsPage>['data']
			}
		});
		cleanup = () => unmount(component);
	} else {
		const component = mount(TeamPostgresPage, {
			target: document.body,
			props: {
				params: { team: params.team },
				data: {
					...permissions,
					get teamSlug() {
						return page.params.team;
					},
					TeamPostgres: {
						...readable({
							data: {
								team: {
									environments: [],
									postgreses: {
										edges: [],
										pageInfo: { ...pageInfo, totalCount: 0 },
										facets: { labels: [] }
									},
									postgresBackups
								}
							},
							errors: null,
							fetching: false
						}),
						fetch
					}
				} as unknown as ComponentProps<typeof TeamPostgresPage>['data']
			}
		});
		cleanup = () => unmount(component);
	}
	flushSync();
}

function clickButton(label: string, root: ParentNode = document) {
	const button = [...root.querySelectorAll<HTMLButtonElement>('button')].find(
		(element) => (element.getAttribute('aria-label') ?? element.textContent?.trim()) === label
	);
	expect(button).toBeDefined();
	button?.click();
	flushSync();
}

function openDialog() {
	return document.querySelector<HTMLElement>('[role="dialog"][data-state="open"]');
}

function navigateToTeam(team: string) {
	const from = page.url;
	page.url = new URL(from.href.replace(`/team/${page.params.team}/`, `/team/${team}/`));
	page.params.team = team;
	for (const [callback] of afterNavigate.mock.calls) {
		callback({ type: 'popstate', from: { url: from }, to: { url: page.url } } as AfterNavigate);
	}
	flushSync();
}

async function submitAndTryEscape(label: string) {
	await vi.waitFor(() => expect(openDialog()).not.toBeNull());
	const dialog = openDialog()!;
	clickButton(label, dialog);
	expect(mutate).toHaveBeenCalledOnce();
	dialog.dispatchEvent(
		new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
	);
	flushSync();
	expect(openDialog()).toBe(dialog);
}

test.each(['fetch', 'pagination'])(
	'keeps creation confirmation visible when %s refresh fails',
	async (refresh) => {
		page.url = new URL(
			`https://console.test/team/test/dev/postgres/database/backups${refresh === 'pagination' ? '?after=cursor' : ''}`
		);
		const result = Promise.withResolvers<unknown>();
		mutate.mockReturnValue(result.promise);
		const fetch = vi.fn().mockRejectedValue(new Error('Network unavailable'));
		goto.mockRejectedValue(new Error('Navigation interrupted'));
		mountPage('database', fetch);

		clickButton('Create backup');
		await submitAndTryEscape('Create backup');
		result.resolve({ data: { createPostgresBackup: { backup: requestedBackup } } });

		await vi.waitFor(() => {
			expect(openDialog()).toBeNull();
			expect(document.body.textContent).toContain(
				'Standalone backup requested-backup was requested.'
			);
			expect(document.body.textContent).toContain('The backup list could not be refreshed.');
		});
		if (refresh === 'pagination') {
			expect(goto).toHaveBeenCalledWith('?', { noScroll: true });
			expect(fetch).not.toHaveBeenCalled();
		} else {
			expect(fetch).toHaveBeenCalledWith({ policy: 'NetworkOnly' });
		}
	}
);

test('polls through a stale creation response and stops once the new backup completes', async () => {
	vi.useFakeTimers();
	vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
	const store = writable(databaseSnapshot());
	const fetch = vi.fn().mockResolvedValue({});
	mutate.mockResolvedValue({ data: { createPostgresBackup: { backup: requestedBackup } } });
	mountPage('database', fetch, store);

	clickButton('Create backup');
	await submitAndTryEscape('Create backup');
	await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

	await vi.advanceTimersByTimeAsync(5_000);
	expect(fetch).toHaveBeenCalledTimes(2);
	await vi.advanceTimersByTimeAsync(5_000);
	expect(fetch).toHaveBeenCalledTimes(3);

	store.set(databaseSnapshot([{ ...requestedBackup, phase: 'RUNNING' }]));
	await vi.advanceTimersByTimeAsync(5_000);
	expect(fetch).toHaveBeenCalledTimes(4);

	store.set(databaseSnapshot([requestedBackup]));
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledTimes(4);

	store.set(databaseSnapshot());
	await vi.advanceTimersByTimeAsync(5_000);
	expect(fetch).toHaveBeenCalledTimes(4);
});

test.each(['database', 'team'] as const)(
	'keeps deletion confirmation visible when the %s backup query returns errors',
	async (view) => {
		const result = Promise.withResolvers<unknown>();
		mutate.mockReturnValue(result.promise);
		const fetch = vi.fn().mockResolvedValue({ errors: [{ message: 'Query failed' }] });
		mountPage(view, fetch);

		clickButton('Delete backup snapshot');
		await submitAndTryEscape('Delete backup');
		result.resolve({ data: { deletePostgresBackup: { deletionRequested: true } } });

		await vi.waitFor(() => {
			expect(openDialog()).toBeNull();
			expect(document.body.textContent).toContain(
				'Deletion requested for standalone backup snapshot.'
			);
			expect(document.body.textContent).toContain('The backup list could not be refreshed.');
		});
		expect(document.querySelector('[aria-label="Delete backup snapshot"]')).toBeNull();
	}
);

test.each(['database', 'team'] as const)(
	'clears an unconfirmed %s delete dialog on team navigation and does not reopen it on return',
	async (view) => {
		mountPage(view, vi.fn());
		clickButton('Delete backup snapshot');
		await vi.waitFor(() => expect(openDialog()).not.toBeNull());

		navigateToTeam('other');
		expect(openDialog()).toBeNull();
		navigateToTeam('test');
		expect(openDialog()).toBeNull();
		expect(mutate).not.toHaveBeenCalled();
	}
);

test('a late deletion response does not affect the dialog or list in another team', async () => {
	const result = Promise.withResolvers<unknown>();
	mutate.mockReturnValue(result.promise);
	const fetch = vi.fn();
	mountPage('team', fetch);
	clickButton('Delete backup snapshot');
	await submitAndTryEscape('Delete backup');
	expect(mutate).toHaveBeenCalledWith({
		input: { teamSlug: 'test', environmentName: 'dev', name: 'snapshot' }
	});

	navigateToTeam('other');
	clickButton('Delete backup snapshot');
	await vi.waitFor(() => expect(openDialog()?.textContent).toContain('bucket for other'));
	const dialog = openDialog();
	result.resolve({ data: { deletePostgresBackup: { deletionRequested: true } } });
	await result.promise;
	flushSync();

	expect(openDialog()).toBe(dialog);
	expect(fetch).not.toHaveBeenCalled();
	expect(document.body.textContent).not.toContain('Deletion requested for');
});
