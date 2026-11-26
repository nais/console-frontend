import type { ComponentProps } from 'svelte';
import { flushSync, mount, unmount } from 'svelte';
import { readable } from 'svelte/store';
import BackupsPage from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/backups/+page.svelte';
import TeamPostgresPage from '../../../routes/team/[team]/postgres/+page.svelte';

const { goto, mutate, page } = vi.hoisted(() => ({
	goto: vi.fn(),
	mutate: vi.fn(),
	page: {
		data: { tenantName: 'nav' },
		params: { team: 'test', env: 'dev', postgres: 'database' },
		url: new URL('https://console.test/team/test/dev/postgres/database/backups')
	}
}));

vi.mock('$app/navigation', () => ({ goto }));
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
let cleanup: (() => Promise<void>) | undefined;

beforeEach(() => {
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
	vi.unstubAllGlobals();
	vi.resetAllMocks();
});

function mountPage(view: 'database' | 'team', fetch: ReturnType<typeof vi.fn>) {
	const permissions = { teamSlug: 'test', viewerIsMember: true, isAdmin: false };
	if (view === 'database') {
		const component = mount(BackupsPage, {
			target: document.body,
			props: {
				params,
				data: {
					...permissions,
					PostgresBackups: {
						...readable({
							data: { team: { environment: { postgres: null }, postgresBackups } },
							errors: null,
							fetching: false
						}),
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
		result.resolve({ data: { createPostgresBackup: { backup: { name: 'requested-backup' } } } });

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
