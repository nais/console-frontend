import type { ComponentProps } from 'svelte';
import { flushSync, mount, unmount } from 'svelte';
import { writable, readable } from 'svelte/store';
import Overview from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/+page.svelte';

vi.mock('$app/state', () => ({
	page: { params: { team: 'test', env: 'dev', postgres: 'database' } }
}));
vi.mock('$houdini', () => ({
	graphql: () => ({ mutate: vi.fn() }),
	paginatedFragment: () =>
		readable({ data: { activityLog: { edges: [] } }, pageInfo: { hasNextPage: false } })
}));

const database = {
	id: 'database',
	name: 'database',
	state: 'PROGRESSING',
	configuration: null,
	majorVersion: '18',
	extensions: [],
	highAvailability: false,
	resources: { cpu: '100m', memory: '512Mi', diskSize: '10Gi' },
	workloads: { nodes: [], pageInfo: { totalCount: 0 } },
	labels: []
};
let component: ReturnType<typeof Overview> | undefined;

afterEach(async () => {
	if (component) await unmount(component);
	component = undefined;
	document.body.replaceChildren();
	vi.useRealTimers();
	vi.restoreAllMocks();
});

test('polls direct progressing state in visible tabs, pauses for fetching/readiness, and cleans up on unmount', async () => {
	vi.useFakeTimers();
	const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
	const snapshot = (state: string, fetching = false) => ({
		fetching,
		errors: null,
		data: { team: { environment: { postgres: { ...database, state } } } }
	});
	const store = writable(snapshot('PROGRESSING'));
	const fetch = vi.fn().mockResolvedValue({});
	component = mount(Overview, {
		target: document.body,
		props: {
			data: {
				teamSlug: 'test',
				viewerIsMember: false,
				isAdmin: false,
				PostgresOverview: { subscribe: store.subscribe, fetch }
			} as unknown as ComponentProps<typeof Overview>['data'],
			params: { team: 'test', env: 'dev', postgres: 'database' }
		}
	});
	flushSync();
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledExactlyOnceWith({ policy: 'NetworkOnly' });

	visibility.mockReturnValue('hidden');
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledTimes(1);
	visibility.mockReturnValue('visible');
	store.set(snapshot('PROGRESSING', true));
	flushSync();
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledTimes(1);
	store.set(snapshot('AVAILABLE'));
	flushSync();
	expect(document.body.textContent).toContain('Ready');
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledTimes(1);
	store.set(snapshot('DEGRADED'));
	flushSync();
	expect(document.body.textContent).toContain('Degraded');
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledTimes(1);
	store.set(snapshot('PROGRESSING'));
	flushSync();
	await vi.advanceTimersByTimeAsync(10_000);
	expect(fetch).toHaveBeenCalledTimes(2);
	await unmount(component);
	component = undefined;
	await vi.advanceTimersByTimeAsync(30_000);
	expect(fetch).toHaveBeenCalledTimes(2);
});

test.each(['completed', 'failed'])(
	'polls an AVAILABLE database while recovery is pending, then stops when %s',
	async (outcome) => {
		vi.useFakeTimers();
		vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
		const recovery = {
			sourcePostgres: 'original',
			targetTime: new Date('2026-01-01T12:00:00Z'),
			completed: false,
			failureMessage: null as string | null
		};
		const snapshot = () => ({
			fetching: false,
			errors: null,
			data: {
				team: {
					environment: { postgres: { ...database, state: 'AVAILABLE', recovery: { ...recovery } } }
				}
			}
		});
		const store = writable(snapshot());
		const fetch = vi.fn().mockResolvedValue({});
		component = mount(Overview, {
			target: document.body,
			props: {
				data: {
					teamSlug: 'test',
					viewerIsMember: false,
					isAdmin: false,
					PostgresOverview: { subscribe: store.subscribe, fetch }
				} as unknown as ComponentProps<typeof Overview>['data'],
				params: { team: 'test', env: 'dev', postgres: 'database' }
			}
		});
		flushSync();
		expect(document.body.textContent).toContain('Restoration is in progress');
		expect(document.body.textContent).toContain('original');
		await vi.advanceTimersByTimeAsync(10_000);
		expect(fetch).toHaveBeenCalledTimes(1);
		if (outcome === 'completed') recovery.completed = true;
		else recovery.failureMessage = 'Required WAL is unavailable';
		store.set(snapshot());
		flushSync();
		expect(document.body.textContent).toContain(
			outcome === 'completed'
				? 'Restoration completed'
				: 'Restoration failed: Required WAL is unavailable'
		);
		await vi.advanceTimersByTimeAsync(20_000);
		expect(fetch).toHaveBeenCalledTimes(1);
	}
);
