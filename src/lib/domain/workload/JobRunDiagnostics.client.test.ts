import type { JobRunDiagnostics$result } from '$houdini';
import JobRunListItem from '#lib/domain/list-items/JobRunListItem.svelte';
import { flushSync, mount, unmount } from 'svelte';
import { writable } from 'svelte/store';
import { vi } from 'vitest';

const mock = vi.hoisted(() => ({ graphql: vi.fn() }));
vi.mock('$houdini', () => ({ graphql: mock.graphql }));

const jobPath = '/team/devteam/dev/job/fixture';
const run = {
	id: 'run-id',
	name: 'fixture-run',
	startTime: null,
	duration: 0,
	status: { state: 'RUNNING' as const, message: 'Run in progress' },
	trigger: { type: 'AUTOMATIC' as const, actor: null }
};

type RunDetails = Extract<JobRunDiagnostics$result['node'], { __typename: 'JobRun' }>;
type Instance = RunDetails['instances']['edges'][number]['node'];
const timestamp = new Date('2026-01-01T10:00:00Z');
const instance: Instance = {
	id: 'instance',
	name: 'fixture-pod',
	created: timestamp,
	restarts: 1,
	image: { name: 'fixture', tag: 'latest', digest: null },
	status: {
		state: 'RUNNING',
		message: 'A platform component keeps crashing.',
		lastExitReason: 'Error',
		lastExitCode: 42,
		lastExitTimestamp: timestamp
	}
};

function showRun(instances: Instance[], hasNextPage = false) {
	const node: RunDetails = {
		id: run.id,
		__typename: 'JobRun',
		instances: {
			edges: instances.map((node) => ({ node, cursor: node.id })),
			pageInfo: {
				hasNextPage,
				hasPreviousPage: false,
				startCursor: instances[0]?.id ?? null,
				endCursor: instances.at(-1)?.id ?? null
			}
		}
	};
	const response = {
		data: { node },
		errors: null,
		fetching: false
	};
	const store = writable({ ...response, data: null } as {
		data: JobRunDiagnostics$result | null;
		errors: { message: string }[] | null;
		fetching: boolean;
	});
	const fetch = vi.fn(async () => store.set(response));
	const loadNextPage = vi.fn<() => Promise<{ errors: { message: string }[] | null }>>();
	mock.graphql.mockReturnValue({ subscribe: store.subscribe, fetch, loadNextPage });
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(JobRunListItem, {
		target,
		props: { run: { ...run, instances: { pageInfo: { totalCount: instances.length } } }, jobPath }
	});
	flushSync();
	return { target, component, fetch, loadNextPage };
}

function open({ target }: ReturnType<typeof showRun>) {
	const toggle = target.querySelector<HTMLButtonElement>('button[aria-expanded]');
	if (!toggle) throw new Error('Missing run details disclosure');
	flushSync(() => toggle.click());
	expect(toggle.getAttribute('aria-expanded')).toBe('true');
}

let fixture: ReturnType<typeof showRun> | undefined;

afterEach(async () => {
	if (fixture) await unmount(fixture.component);
	fixture = undefined;
	document.body.replaceChildren();
	mock.graphql.mockReset();
});

test('loads instance details only when opened and keeps current status next to the last exit', async () => {
	fixture = showRun([
		instance,
		{
			...instance,
			id: 'completed-instance',
			name: 'completed-pod',
			restarts: 0,
			status: {
				...instance.status,
				state: 'SUCCEEDED',
				message: 'Completed successfully.',
				lastExitReason: 'Completed',
				lastExitCode: 0
			}
		}
	]);
	const { fetch, target } = fixture;
	expect(fetch).not.toHaveBeenCalled();
	open(fixture);

	await vi.waitFor(() => expect(target.textContent).toContain('Completed (code 0)'));
	expect(target.textContent).toContain('Run in progress');
	expect(target.textContent).toContain('A platform component keeps crashing.');
	expect(target.textContent).toContain('Error (code 42)');
	expect(
		target.querySelector('a[aria-label="View logs for fixture-pod"]')?.getAttribute('href')
	).toBe(`${jobPath}/logs?instance=fixture-pod`);
});

test('offers Events instead of a dead log link for a run with no instances', async () => {
	fixture = showRun([]);
	open(fixture);
	const { target } = fixture;
	await vi.waitFor(() => expect(target.textContent).toContain('No instances found for this run.'));
	expect(target.querySelector(`a[href="${jobPath}/events"]`)?.textContent).toBe('View job events');
	expect(target.querySelector('a[href*="/logs"]')).toBeNull();
});

test('shows returned pagination errors without replacing loaded instances and clears them on retry', async () => {
	fixture = showRun([instance], true);
	const { loadNextPage, target } = fixture;
	loadNextPage
		.mockResolvedValueOnce({ errors: [{ message: 'Unable to list more instances' }] })
		.mockResolvedValueOnce({ errors: null });
	open(fixture);

	const next = await vi.waitFor(() => {
		const button = [...target.querySelectorAll('button')].find(
			(button) => button.textContent.trim() === 'Load more instances'
		);
		if (!button) throw new Error('Missing Load more instances button');
		return button;
	});
	next.click();
	await vi.waitFor(() => expect(target.textContent).toContain('Unable to list more instances'));
	expect(target.textContent).toContain('fixture-pod');

	next.click();
	await vi.waitFor(() => expect(target.textContent).not.toContain('Unable to list more instances'));
	expect(loadNextPage).toHaveBeenCalledTimes(2);
});
