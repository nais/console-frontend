import { load_PostgresInsights, load_PostgresQueryStatistics } from '$houdini';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import { load } from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/queries/+page.js';

const fixture = vi.hoisted(() => ({
	postgres: null as object | null,
	errors: null as object[] | null
}));

vi.mock('$houdini', () => ({
	load_PostgresInsights: vi.fn(async () => ({
		PostgresInsights: readable({
			data: { team: { environment: { postgres: fixture.postgres } } },
			errors: fixture.errors
		})
	})),
	load_PostgresQueryStatistics: vi.fn(async () => ({
		PostgresQueryStatistics: readable({ data: null, errors: null })
	})),
	PostgresQueryStatisticsStore: class {
		subscribe = readable({ data: null, errors: null }).subscribe;
	}
}));

vi.mock('#lib/utils/pageMeta.js', () => ({
	addPageMeta: vi.fn(async () => ({}))
}));

function event(search = '') {
	return {
		url: new URL(`https://console.test/team/team/dev/postgres/database/queries${search}`),
		params: { team: 'team', env: 'dev', postgres: 'database' }
	} as Parameters<typeof load>[0];
}

beforeEach(() => {
	vi.clearAllMocks();
	fixture.errors = null;
	fixture.postgres = { id: 'database' };
});

describe('Postgres query insights load', () => {
	test('loads database metadata before fetching database-scoped statistics without a branch label', async () => {
		const result = await load(event());
		expect(result).toMatchObject({ interval: '1h' });
		expect(result).not.toHaveProperty('branch');
		expect(load_PostgresInsights).toHaveBeenCalledWith(
			expect.objectContaining({
				blocking: true,
				variables: { team: 'team', env: 'dev', name: 'database' }
			})
		);
		expect(load_PostgresQueryStatistics).toHaveBeenCalledWith(
			expect.objectContaining({
				blocking: true,
				variables: {
					environmentName: 'dev',
					input: {
						time: expect.any(Date),
						query: expect.stringContaining('postgres="database",datname="app"')
					}
				}
			})
		);
		expect(vi.mocked(load_PostgresInsights)).toHaveBeenCalledBefore(
			vi.mocked(load_PostgresQueryStatistics)
		);
	});

	test('honours legacy main links and intervals but ignores obsolete database filters', async () => {
		const result = await load(event('?branch=main&database=postgres&interval=6h'));
		expect(result).toMatchObject({ interval: '6h' });
		expect(result).not.toHaveProperty('database');
		expect(load_PostgresQueryStatistics).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					input: expect.objectContaining({
						query: expect.stringContaining('postgres="database",datname="app"}[6h]')
					})
				})
			})
		);
	});

	test('falls back to a safe interval rather than interpolating arbitrary PromQL', async () => {
		expect(await load(event('?interval=bad-value'))).toMatchObject({ interval: '1h' });
	});

	test('rejects non-main links before fetching metadata or metrics', async () => {
		await expect(load(event('?branch=older'))).rejects.toMatchObject({ status: 400 });
		expect(load_PostgresInsights).not.toHaveBeenCalled();
		expect(load_PostgresQueryStatistics).not.toHaveBeenCalled();
	});

	test.each([
		{ postgres: null, errors: null },
		{
			postgres: { id: 'database' },
			errors: [{ message: 'Denied' }]
		}
	])('does not fetch metrics when database metadata is unavailable: %j', async (state) => {
		fixture.postgres = state.postgres;
		fixture.errors = state.errors;
		await load(event());
		expect(load_PostgresQueryStatistics).not.toHaveBeenCalled();
	});
});
