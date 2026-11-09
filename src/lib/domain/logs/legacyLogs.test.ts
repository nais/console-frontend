import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import TeamLogs from './TeamLogs.svelte';
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

const legacyDestinations = [{ __typename: 'LogDestinationGeneric', name: 'elastic' }];

function application(
	logDestinations: unknown[] = legacyDestinations,
	projectID: string | null = 'team-dev-project'
) {
	return {
		team: {
			slug: 'team',
			environment: {
				gcpProjectID: projectID,
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

function job(
	logDestinations: unknown[] = legacyDestinations,
	running = true,
	completedRunName = 'job-run-2',
	projectID: string | null = 'team-dev-project'
) {
	return {
		team: {
			slug: 'team',
			environment: {
				gcpProjectID: projectID,
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
								name: completedRunName,
								status: { state: 'COMPLETED' },
								instances: { nodes: [{ name: `${completedRunName}-one` }] }
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
			const label = content.match(/<span\b[^>]*>(?:\s|<!--[\s\S]*?-->)*([^<]*)/);
			expect(label).not.toBeNull();
			return label![1].trim();
		})
		.filter((value) => !['Time', 'Level', 'Instance'].includes(value));
}

beforeEach(() => {
	page.url = new URL('https://console.example.com/logs');
});

describe.each(['application', 'job'] as const)('%s log viewer fallback', (kind) => {
	async function view(destinations: unknown[], projectID: string | null = 'team-dev-project') {
		return kind === 'application'
			? render(Logs, { props: application(destinations, projectID) })
			: render(JobLogs, { props: job(destinations, true, 'job-run-2', projectID) });
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
		expect(body).not.toContain('Open Team Logs');
	});

	it('continues to use the explorer when Loki is configured', async () => {
		const { body } = await view([
			{ __typename: 'LogDestinationLoki', grafanaURL: 'https://grafana.example.com' }
		]);
		expect(body).toContain('Search log content');
		expect(body).not.toContain('old log viewer');
		expect(body).not.toContain('Open Team Logs');
	});

	it.each([false, true])(
		'preserves the legacy viewer with Team Logs present: %s',
		async (secure) => {
			const { body } = await view([
				...legacyDestinations,
				...(secure ? [{ __typename: 'LogDestinationSecureLogs' }] : [])
			]);
			expect(body).toContain('Clear logs');
			expect(body).not.toContain('Search log content');
			expect(body.includes('Open Team Logs')).toBe(secure);
		}
	);

	it('does not start a log viewer when standard forwarding is disabled', async () => {
		const { body } = await view([]);
		expect(body).toContain('No standard log destination is configured for this workload.');
		expect(body).not.toContain('Clear logs');
		expect(body).not.toContain('Search log content');
		expect(body).not.toContain('Open Team Logs');
	});

	it('prefers Loki over a legacy destination when Team Logs is also present', async () => {
		const { body } = await view([
			...legacyDestinations,
			{ __typename: 'LogDestinationLoki', grafanaURL: 'https://grafana.example.com' },
			{ __typename: 'LogDestinationSecureLogs' }
		]);
		expect(body).toContain('Search log content');
		expect(body).toContain('Open Team Logs');
		expect(body).not.toContain('Clear logs');
	});

	it.each([false, true])(
		'links secure workloads to Team Logs (Loki configured: %s)',
		async (loki) => {
			const { body } = await view([
				{ __typename: 'LogDestinationSecureLogs' },
				...(loki
					? [{ __typename: 'LogDestinationLoki', grafanaURL: 'https://grafana.example.com' }]
					: [])
			]);
			const href = body.match(
				/href="(https:\/\/console\.cloud\.google\.com\/logs\/query[^"]*)"/
			)?.[1];
			expect(href).toBeDefined();
			const url = new URL(href!);
			expect(url.searchParams.get('project')).toBe('team-dev-project');
			expect(decodeURIComponent(url.pathname.split(';query=')[1])).toBe(
				`resource.labels.namespace_name="team"\nresource.labels.container_name="${kind === 'application' ? 'app' : 'job'}"`
			);
			expect(body).toContain('Open Team Logs');
			expect(body).toContain('target="_blank" rel="noopener noreferrer"');
			expect(body).not.toContain('Requires configured log forwarding');
			expect(body).not.toContain('This workload uses Team Logs');
			expect(body).not.toContain('Clear logs');
			if (loki) {
				expect(body).toContain('Search log content');
				expect(body).toContain('Open Grafana');
				const settings = body.indexOf('aria-label="Log settings"');
				expect(body.indexOf('Open Grafana')).toBeLessThan(settings);
				expect(body.indexOf('Open Team Logs')).toBeLessThan(settings);
				expect(body.indexOf('Open traces')).toBeLessThan(settings);
				expect(body.match(/Open Team Logs/g)).toHaveLength(1);
				expect(body).toContain('https://grafana.example.com');
				expect(body).toContain('Open traces');
			} else {
				expect(body).not.toContain('Search log content');
				expect(body).toContain('No standard log destination is configured for this workload.');
			}
		}
	);

	it.each([false, true])('explains a missing project without hiding Loki (%s)', async (loki) => {
		const { body } = await view(
			[
				{ __typename: 'LogDestinationSecureLogs' },
				...(loki
					? [{ __typename: 'LogDestinationLoki', grafanaURL: 'https://grafana.example.com' }]
					: [])
			],
			null
		);
		expect(body).toContain('this environment has no GCP project ID');
		expect(body).not.toContain('Open Team Logs');
		expect(body).not.toContain('console.cloud.google.com');
		expect(body).not.toContain('Clear logs');
		if (loki) {
			expect(body).toContain('Search log content');
		} else {
			expect(body).not.toContain('Search log content');
		}
	});
});

it('encodes the Team Logs project and query values without allowing extra URL parameters or filters', async () => {
	const { body } = await render(TeamLogs, {
		props: {
			projectID: 'project&other=value',
			team: 'team "one"',
			workload: 'app" OR severity>=ERROR\n;query=other/#'
		}
	});
	const href = body.match(/href="(https:\/\/console\.cloud\.google\.com\/logs\/query[^"]*)"/)?.[1];
	expect(href).toBeDefined();
	const url = new URL(href!);
	expect([...url.searchParams]).toEqual([['project', 'project&other=value']]);
	expect(url.hash).toBe('');
	expect(body).not.toContain('role="status"');
	expect(body).not.toContain('role="alert"');
	expect(body).not.toContain('sh-ui-alert');
	expect(decodeURIComponent(url.pathname.split(';query=')[1])).toBe(
		'resource.labels.namespace_name="team \\"one\\""\nresource.labels.container_name="app\\" OR severity>=ERROR\\n;query=other/#"'
	);
});

it('shows missing Team Logs project information as plain text, not an alert', async () => {
	const { body } = await render(TeamLogs, {
		props: { projectID: null, team: 'team', workload: 'app' }
	});
	expect(body).toContain('this environment has no GCP project ID');
	expect(body).not.toContain('<a ');
	expect(body).not.toContain('role="status"');
	expect(body).not.toContain('role="alert"');
	expect(body).not.toContain('sh-ui-alert');
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
	const { body } = await render(JobLogs, { props: job(legacyDestinations, false) });
	expect(selectedInstances(body)).toEqual(['run-1-one', 'run-1-two', 'run-2-one']);
});

it('selects all instances for a linked job run instead of the running run', async () => {
	page.url.searchParams.set('instance', 'job-run-2');
	const { body } = await render(JobLogs, { props: job() });
	expect(selectedInstances(body)).toEqual(['run-2-one']);
});

it('matches a linked run exactly before matching instance prefixes', async () => {
	page.url.searchParams.set('instance', 'job-run-1');
	const { body } = await render(JobLogs, { props: job(legacyDestinations, true, 'job-run-10') });
	expect(selectedInstances(body)).toEqual(['run-1-one', 'run-1-two']);
});

it('still matches instance prefixes when no run name matches exactly', async () => {
	page.url.searchParams.set('instance', 'job-run-1-o');
	const { body } = await render(JobLogs, { props: job() });
	expect(selectedInstances(body)).toEqual(['run-1-one']);
});

it('shows an empty state instead of streaming all instances for an unmatched job run', async () => {
	page.url.searchParams.set('instance', 'unknown-run');
	const { body } = await render(JobLogs, { props: job() });
	expect(selectedInstances(body)).toEqual([]);
	expect(body).toContain('No instances selected.');
});
