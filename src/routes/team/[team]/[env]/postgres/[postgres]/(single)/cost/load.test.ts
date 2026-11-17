import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { load as loadOverview } from '../+page';
import { load as loadCost } from './+page';

const { overviewQuery, costQuery } = vi.hoisted(() => ({
	overviewQuery: vi.fn().mockResolvedValue({}),
	costQuery: vi.fn().mockResolvedValue({})
}));

vi.mock('$houdini', () => ({
	load_PostgresOverview: overviewQuery,
	load_PostgresCosts: costQuery
}));
vi.mock('#lib/utils/pageMeta.js', () => ({
	addPageMeta: vi.fn().mockResolvedValue({})
}));

beforeEach(() => {
	vi.clearAllMocks();
	vi.useFakeTimers();
	vi.setSystemTime(new Date(2026, 10, 17, 12));
});

afterEach(() => {
	vi.useRealTimers();
	vi.unstubAllEnvs();
});

const params = { team: 'example-team', env: 'dev-gcp', postgres: 'example-db' };

test('opening Overview does not load cost data', async () => {
	const event = {
		params,
		url: new URL('http://localhost/overview')
	} as Parameters<typeof loadOverview>[0];
	await loadOverview(event);

	expect(overviewQuery).toHaveBeenCalledOnce();
	expect(costQuery).not.toHaveBeenCalled();
});

test('opening Cost loads only cost data with its own period and billing delay', async () => {
	const event = {
		params,
		url: new URL('http://localhost/cost?interval=90d')
	} as Parameters<typeof loadCost>[0];
	const result = await loadCost(event);

	expect(overviewQuery).not.toHaveBeenCalled();
	expect(costQuery).toHaveBeenCalledExactlyOnceWith({
		event,
		variables: {
			team: 'example-team',
			env: 'dev-gcp',
			name: 'example-db',
			from: new Date(2026, 7, 17, 12),
			to: new Date(2026, 10, 15, 12)
		}
	});
	expect(result.interval).toBe('90d');
});

test.each([
	{ timezone: 'Europe/Oslo', hour: 0 },
	{ timezone: 'America/Los_Angeles', hour: 23 }
])('displays the queried calendar dates near midnight in $timezone', async ({ timezone, hour }) => {
	vi.stubEnv('TZ', timezone);
	vi.setSystemTime(new Date(2026, 10, 17, hour, 30));
	const event = {
		params,
		url: new URL('http://localhost/cost?interval=30d')
	} as Parameters<typeof loadCost>[0];

	const result = await loadCost(event);

	expect(result.from.toISOString()).toBe('2026-10-16T00:00:00.000Z');
	expect(result.to.toISOString()).toBe('2026-11-15T00:00:00.000Z');
	expect(costQuery).toHaveBeenCalledExactlyOnceWith({
		event,
		variables: {
			team: 'example-team',
			env: 'dev-gcp',
			name: 'example-db',
			from: new Date(2026, 9, 16, hour, 30),
			to: new Date(2026, 10, 15, hour, 30)
		}
	});
});
