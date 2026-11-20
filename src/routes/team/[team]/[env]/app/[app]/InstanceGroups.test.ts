import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { applicationInstanceStatus } from '#lib/domain/workload/applicationReadiness.js';
import InstanceGroups from './InstanceGroups.svelte';

type Props = ComponentProps<typeof InstanceGroups>;
type Group = Props['instanceGroups'][number];

const app = {
	appName: 'example',
	teamSlug: 'demo',
	environmentName: 'dev',
	readyInstances: 0
} satisfies Omit<Props, 'instanceGroups'>;

const basePath = '/team/demo/dev/app/example';

function group(name: string, created: Date, instances: Group['instances']): Group {
	return {
		id: name,
		name,
		created,
		desiredInstances: Math.max(instances.length, 1),
		image: { name: 'example', tag: name, digest: null },
		instances
	};
}

test('shows readiness counts and current reasons without treating a running process as ready', async () => {
	const instanceGroups = [
		group('incoming', new Date('2026-01-02'), [
			{ id: 'a', status: { state: 'RUNNING', ready: true, message: 'Running and ready.' } },
			{
				id: 'b',
				status: { state: 'RUNNING', ready: false, message: 'A platform component is not ready.' }
			},
			{ id: 'c', status: { state: 'PENDING', ready: false, message: 'Not enough memory.' } },
			{ id: 'd', status: { state: 'STARTING', ready: false, message: 'Starting the instance.' } },
			{ id: 'e', status: { state: 'PENDING', ready: false, message: 'Not enough memory.' } }
		])
	];
	const { body } = await render(InstanceGroups, {
		props: { ...app, instanceGroups, readyInstances: 1 }
	});

	expect(body).toContain('1/5 ready');
	expect(body).toContain('Running, not ready');
	expect(body).toContain('A platform component is not ready.');
	expect(body).toContain('2 · Waiting for placement');
	expect(body.match(/Not enough memory\./g)).toHaveLength(1);
	expect(body).toContain('1 · Starting');
	expect(body).not.toContain('Rollout stuck');
	expect(applicationInstanceStatus(instanceGroups[0].instances[0].status).label).toBe('Ready');
});

test('shows a live rollout timeout even while an older instance is ready', async () => {
	const previous = group('previous', new Date('2026-01-01'), [
		{ id: 'a', status: { state: 'RUNNING', ready: true, message: 'Running and ready.' } }
	]);
	const incoming = group('incoming', new Date('2026-01-02'), [
		{ id: 'b', status: { state: 'RUNNING', ready: false, message: 'Readiness check failed.' } }
	]);
	const { body } = await render(InstanceGroups, {
		props: {
			...app,
			instanceGroups: [previous, incoming],
			readyInstances: 1,
			rolloutIssue: { reason: 'TIMED_OUT', message: 'The new version missed its deadline.' }
		}
	});

	expect(body).toContain('Rollout stuck: New version did not become ready in time');
	expect(body).toContain('The new version missed its deadline.');
	expect(body).toContain('1 instance is still ready to receive traffic.');
	expect(body).toContain(`href="${basePath}/instancegroup/incoming">Inspect incoming instances`);
	expect(body).toContain(`href="${basePath}/events">View workload events`);
	expect(body).not.toContain('Incoming instance group');
});

test.each(['none', 'previous only', 'empty incoming', 'multiple older groups'])(
	'links to events when no new instances exist (%s)',
	async (scenario) => {
		const previous = group('previous', new Date('2026-01-01'), [
			{ id: 'a', status: { state: 'RUNNING', ready: true, message: 'Running and ready.' } }
		]);
		const instanceGroups = scenario === 'none' ? [] : [previous];
		if (scenario === 'empty incoming') {
			instanceGroups.push(group('empty', new Date('2026-01-02'), []));
		} else if (scenario === 'multiple older groups') {
			instanceGroups.push(group('older', new Date('2025-12-30'), previous.instances));
		}
		const { body } = await render(InstanceGroups, {
			props: {
				...app,
				instanceGroups,
				readyInstances: scenario === 'none' ? 0 : 1,
				rolloutIssue: {
					reason: 'INSTANCE_CREATION_FAILED',
					message: 'A quota prevents the new instances from being created.'
				}
			}
		});

		expect(body).toContain('Rollout stuck: Instances could not be created');
		expect(body).toContain('A quota prevents the new instances from being created.');
		expect(body).toContain(`href="${basePath}/events">View workload events`);
		expect(body).not.toContain('Inspect incoming instances');
		expect(body).not.toContain('Inspect available instances');
		expect(body).not.toContain('>Incoming<');
	}
);
