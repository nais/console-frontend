import type { JobRunDiagnostics$result } from '$houdini';
import JobRunListItem from '#lib/domain/list-items/JobRunListItem.svelte';
import { flushSync, mount, unmount } from 'svelte';
import { writable } from 'svelte/store';
import { vi } from 'vitest';

const mock = vi.hoisted(() => ({ graphql: vi.fn() }));
vi.mock('$houdini', () => ({ graphql: mock.graphql }));

const jobPath = '/team/devteam/dev/job/fixture';
const noMorePages = {
	hasNextPage: false,
	hasPreviousPage: false,
	startCursor: null,
	endCursor: null
};
const run = {
	id: 'run-id',
	name: 'fixture-run',
	startTime: null,
	duration: 0,
	status: { state: 'RUNNING', message: 'Run in progress' },
	trigger: { type: 'AUTOMATIC' as const, actor: null },
	instances: { pageInfo: { totalCount: 2 } }
};

function showRun(node: JobRunDiagnostics$result['node'], count = 2) {
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
	mock.graphql.mockReturnValue({ subscribe: store.subscribe, fetch });
	const target = document.createElement('div');
	document.body.append(target);
	const component = mount(JobRunListItem, {
		target,
		props: { run: { ...run, instances: { pageInfo: { totalCount: count } } }, jobPath }
	});
	flushSync();
	return { target, component, fetch };
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
	const instance = {
		id: 'instance',
		name: 'fixture-pod',
		created: new Date('2026-01-01T10:00:00Z'),
		restarts: 1,
		image: { name: 'fixture', tag: 'latest', digest: null },
		status: {
			state: 'RUNNING' as const,
			message: 'A platform component keeps crashing.',
			lastExitReason: 'Error',
			lastExitCode: 42,
			lastExitTimestamp: new Date('2026-01-01T10:01:00Z')
		}
	};
	fixture = showRun({
		id: run.id,
		__typename: 'JobRun',
		instances: {
			edges: [
				{ node: instance, cursor: 'first' },
				{
					cursor: 'last',
					node: {
						...instance,
						id: 'completed-instance',
						name: 'completed-pod',
						status: {
							...instance.status,
							state: 'SUCCEEDED',
							message: 'Completed successfully.',
							lastExitReason: 'Completed',
							lastExitCode: 0
						}
					}
				}
			],
			pageInfo: { ...noMorePages, startCursor: 'first', endCursor: 'last' }
		}
	});
	const { fetch, target } = fixture;
	expect(fetch).not.toHaveBeenCalled();
	open(fixture);

	await vi.waitFor(() => expect(target.textContent).toContain('Completed (code 0)'));
	expect(fetch).toHaveBeenCalledWith(
		expect.objectContaining({ variables: { id: run.id, first: 10 } })
	);
	expect(target.textContent).toContain('Run in progress');
	expect(target.textContent).toContain('A platform component keeps crashing.');
	expect(target.textContent).toContain('Error (code 42)');
	expect(
		target.querySelector('a[aria-label="View logs for fixture-pod"]')?.getAttribute('href')
	).toBe(`${jobPath}/logs?instance=fixture-pod`);
});

test('offers Events instead of a dead log link for a run with no instances', async () => {
	fixture = showRun(
		{
			id: run.id,
			__typename: 'JobRun',
			instances: { edges: [], pageInfo: noMorePages }
		},
		0
	);
	open(fixture);
	const { target } = fixture;
	await vi.waitFor(() => expect(target.textContent).toContain('No instances found for this run.'));
	expect(target.querySelector(`a[href="${jobPath}/events"]`)?.textContent).toBe('View job events');
	expect(target.querySelector('a[href*="/logs"]')).toBeNull();
});
