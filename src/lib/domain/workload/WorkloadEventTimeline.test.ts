import type { WorkloadEventsFields$data } from '$houdini';
import { render } from 'svelte/server';
import WorkloadEventTimeline from './WorkloadEventTimeline.svelte';

const firstSeenAt = new Date('2026-11-18T10:00:00Z');
const triggeredAt = new Date('2026-11-19T10:00:00Z');

test.each([false, true])(
	'shows repeated warnings, restarts and rescaling (compact: %s)',
	async (compact) => {
		const events: WorkloadEventsFields$data = {
			nodes: [
				{
					__typename: 'WorkloadWarningEvent',
					id: 'warning',
					kind: 'PLACEMENT_FAILED',
					message: 'No server has enough CPU.',
					instance: 'app-a1',
					count: 3,
					firstSeenAt,
					triggeredAt
				},
				{
					__typename: 'WorkloadKillingEvent',
					id: 'restart',
					message: 'Instance restarted',
					reason: '',
					container: '',
					triggeredAt: firstSeenAt
				},
				{
					__typename: 'WorkloadKillingEvent',
					id: 'restart-with-details',
					message: 'Instance restarted',
					reason: 'liveness_probe_failed',
					container: 'worker',
					triggeredAt: firstSeenAt
				},
				{
					__typename: 'WorkloadSuccessfulRescaleEvent',
					id: 'rescale',
					message: 'Scaled up to three instances.',
					triggeredAt: firstSeenAt
				}
			],
			pageInfo: {
				startCursor: null,
				endCursor: null,
				hasNextPage: false,
				hasPreviousPage: false,
				pageStart: 1,
				pageEnd: 4,
				totalCount: 4
			}
		};
		const { body } = await render(WorkloadEventTimeline, { props: { events, compact } });

		expect(body.match(/Placement failed/g)).toHaveLength(1);
		expect(body).toContain('No server has enough CPU.');
		expect(body).toContain('app-a1');
		expect(body).toContain('3 occurrences');
		expect(body).toContain('First seen');
		expect(body).toContain('Last seen');
		expect(body.match(/Instance restarted/g) ?? []).toHaveLength(compact ? 0 : 1);
		expect(body).toContain('Liveness probe failed');
		expect(body).toMatch(/Container: <code[^>]*>worker<\/code>/);
		expect(body).toContain('Scaled up to three instances.');
		expect(body.match(/<time\b/g)).toHaveLength(5);
		const timestamps = body.match(/class="event-meta event-timestamp[^"]*"[^>]*>[\s\S]*?<\/div>/g);
		expect(timestamps).toHaveLength(4);
		expect(timestamps?.[0]).toContain(`datetime="${triggeredAt.toISOString()}"`);
		expect(timestamps?.[0]).not.toContain(`datetime="${firstSeenAt.toISOString()}"`);
		expect(body.match(/>\d{1,2} \w{3}, \d{2}:\d{2}:\d{2}<\/time>/g)).toHaveLength(5);
	}
);

test.each([
	{ count: 2, lastSeenAt: new Date('2026-11-18T10:00:00.500Z'), endClock: /\d{2}:\d{2}:00\.500/ },
	{ count: 1, lastSeenAt: firstSeenAt, endClock: null }
])(
	'shows the latest timestamp once and only adds first seen when it differs ($count occurrences)',
	async ({ count, lastSeenAt, endClock }) => {
		const events: WorkloadEventsFields$data = {
			nodes: [
				{
					__typename: 'WorkloadWarningEvent',
					id: 'health-check',
					kind: 'HEALTH_CHECK_FAILED',
					message: 'Readiness check failed.',
					instance: 'app-a1',
					count,
					firstSeenAt,
					triggeredAt: lastSeenAt
				}
			],
			pageInfo: {
				startCursor: null,
				endCursor: null,
				hasNextPage: false,
				hasPreviousPage: false,
				pageStart: 1,
				pageEnd: 1,
				totalCount: 1
			}
		};
		const { body } = await render(WorkloadEventTimeline, { props: { events } });

		expect(body).toContain(endClock ? 'Last seen' : '>Seen</span>');
		expect(body.match(/<time\b/g)).toHaveLength(endClock ? 2 : 1);
		expect(body.includes('First seen')).toBe(Boolean(endClock));
		expect(body.includes('Last seen')).toBe(Boolean(endClock));
		expect(body.includes(`${count} occurrences`)).toBe(count > 1);
		const timestamps = body.match(/class="event-meta event-timestamp[^"]*"[^>]*>[\s\S]*?<\/div>/g);
		expect(timestamps).toHaveLength(1);
		expect(timestamps?.[0]).toContain(`datetime="${lastSeenAt.toISOString()}"`);
		if (endClock) {
			expect(timestamps?.[0]).toMatch(new RegExp(`${endClock.source}</time>`));
			expect(body.indexOf(`datetime="${firstSeenAt.toISOString()}"`)).toBeGreaterThan(
				body.indexOf(`datetime="${lastSeenAt.toISOString()}"`)
			);
		}
	}
);

test('distinguishes an event loading error from an empty history', async () => {
	const empty = await render(WorkloadEventTimeline, { props: { events: undefined } });
	const failed = await render(WorkloadEventTimeline, {
		props: { events: undefined, failed: true }
	});

	expect(empty.body).toContain('No recent events');
	expect(failed.body).toContain('Could not load workload events.');
	expect(failed.body).not.toContain('No recent events');
});
