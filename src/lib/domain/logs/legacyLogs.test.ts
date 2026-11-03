import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Logs from '../../../routes/team/[team]/[env]/app/[app]/logs/Logs.svelte';
import JobLogs from '../../../routes/team/[team]/[env]/job/[job]/logs/JobLogs.svelte';

const page = vi.hoisted(() => ({
	url: new URL('https://console.example.com/logs'),
	params: { team: 'team', app: 'app', job: 'job' },
	data: { tenantName: 'nav' }
}));

vi.mock('$app/state', () => ({ page }));
vi.mock('$houdini', () => ({
	JobRunState: { RUNNING: 'RUNNING' },
	graphql: () => ({})
}));

function application(logDestinations: unknown[] = []) {
	return {
		team: {
			slug: 'team',
			environment: {
				environment: { name: 'dev-gcp' },
				application: {
					name: 'app',
					logDestinations,
					instances: { nodes: [{ name: 'app-one' }, { name: 'app-two' }] }
				}
			}
		}
	} as ComponentProps<typeof Logs>;
}

function job(logDestinations: unknown[] = [], running = true) {
	return {
		team: {
			slug: 'team',
			environment: {
				environment: { name: 'dev-gcp' },
				job: {
					name: 'job',
					logDestinations,
					runs: {
						nodes: [
							{
								name: 'job-run-1',
								status: { state: running ? 'RUNNING' : 'COMPLETED' },
								instances: { nodes: [{ name: 'job-run-1-one' }, { name: 'job-run-1-two' }] }
							},
							{
								name: 'job-run-2',
								status: { state: 'COMPLETED' },
								instances: { nodes: [{ name: 'job-run-2-one' }] }
							}
						]
					}
				}
			}
		}
	} as ComponentProps<typeof JobLogs>;
}

function selectedInstances(body: string) {
	return [...body.matchAll(/<button\b[^>]*aria-pressed="true"[^>]*>([\s\S]*?)<\/button>/g)]
		.map(([, content]) => {
			const label = content.match(
				/<span class="aksel-chips__chip-text">(?:\s|<!--[\s\S]*?-->)*([^<]*)/
			);
			expect(label).not.toBeNull();
			return label![1].trim();
		})
		.filter((value) => !['Time', 'Level', 'Instance'].includes(value));
}

beforeEach(() => {
	page.url = new URL('https://console.example.com/logs');
});

describe.each(['application', 'job'] as const)('%s log viewer fallback', (kind) => {
	async function view(destinations: unknown[]) {
		return kind === 'application'
			? render(Logs, { props: application(destinations) })
			: render(JobLogs, { props: job(destinations) });
	}

	it('shows the legacy viewer and migration warning without Loki', async () => {
		const { body } = await view([{ __typename: 'LogDestinationGeneric', name: 'elastic' }]);
		expect(body).toContain('new logs explorer powered by Loki');
		expect(body).toContain('Configure Loki as a log destination');
		expect(body).toContain('https://docs.nais.io/observability/logging/how-to/loki/');
		expect(body).toContain('Pause');
		expect(body).toContain('Clear logs');
		expect(body).not.toContain('This workload has no Loki log destination.');
		expect(body).not.toContain('Search log content');
	});

	it('continues to use the explorer when Loki is configured', async () => {
		const { body } = await view([
			{ __typename: 'LogDestinationLoki', grafanaURL: 'https://grafana.example.com' }
		]);
		expect(body).toContain('Search log content');
		expect(body).not.toContain('old log viewer');
	});

	it('does not stream secure workloads through the legacy fallback', async () => {
		const { body } = await view([{ __typename: 'LogDestinationSecureLogs' }]);
		expect(body).toContain('unavailable for workloads with secure log destinations');
		expect(body).not.toContain('Clear logs');
		expect(body).not.toContain('Search log content');
	});
});

it('preserves application instance deep links', async () => {
	page.url.searchParams.set('instance', 'app-two');
	const { body } = await render(Logs, { props: application() });
	expect(selectedInstances(body)).toEqual(['two']);
});

it('selects running job instances by default', async () => {
	const { body } = await render(JobLogs, { props: job() });
	expect(selectedInstances(body)).toEqual(['run-1-one', 'run-1-two']);
});

it('selects all job instances when no runs are running', async () => {
	const { body } = await render(JobLogs, { props: job([], false) });
	expect(selectedInstances(body)).toEqual(['run-1-one', 'run-1-two', 'run-2-one']);
});

it('selects all instances for a linked job run instead of the running run', async () => {
	page.url.searchParams.set('instance', 'job-run-2');
	const { body } = await render(JobLogs, { props: job() });
	expect(selectedInstances(body)).toEqual(['run-2-one']);
});

it('shows an empty state instead of streaming all instances for an unmatched job run', async () => {
	page.url.searchParams.set('instance', 'unknown-run');
	const { body } = await render(JobLogs, { props: job() });
	expect(selectedInstances(body)).toEqual([]);
	expect(body).toContain('No instances selected.');
});
