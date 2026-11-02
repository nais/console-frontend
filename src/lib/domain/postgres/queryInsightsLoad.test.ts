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
	fixture.postgres = {
		activeBranch: { name: 'main' },
		branches: { nodes: [{ name: 'preview' }] }
	};
});

describe('Postgres query insights load', () => {
	test('loads branch metadata before fetching statistics for the active branch', async () => {
		const result = await load(event());
		expect(result).toMatchObject({ branch: 'main', interval: '1h' });
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
					input: { time: expect.any(Date), query: expect.stringContaining('branch="main"') }
				}
			})
		);
		expect(vi.mocked(load_PostgresInsights)).toHaveBeenCalledBefore(
			vi.mocked(load_PostgresQueryStatistics)
		);
	});

	test('honours deep-linked branches and intervals but ignores obsolete database filters', async () => {
		const result = await load(event('?branch=older&database=postgres&interval=6h'));
		expect(result).toMatchObject({ branch: 'older', interval: '6h' });
		expect(result).not.toHaveProperty('database');
		expect(load_PostgresQueryStatistics).toHaveBeenCalledWith(
			expect.objectContaining({
				variables: expect.objectContaining({
					input: expect.objectContaining({
						query: expect.stringContaining('branch="older",datname="app"}[6h]')
					})
				})
			})
		);
	});

	test('falls back to a safe interval rather than interpolating arbitrary PromQL', async () => {
		expect(await load(event('?interval=bad-value'))).toMatchObject({ interval: '1h' });
	});

	test('uses the first branch while no active branch exists', async () => {
		fixture.postgres = { activeBranch: null, branches: { nodes: [{ name: 'preview' }] } };
		expect(await load(event())).toMatchObject({ branch: 'preview' });
	});

	test.each([
		{ postgres: null, errors: null },
		{ postgres: { activeBranch: null, branches: { nodes: [] } }, errors: null },
		{
			postgres: { activeBranch: { name: 'main' }, branches: { nodes: [] } },
			errors: [{ message: 'Denied' }]
		}
	])('does not fetch metrics when branch metadata is unavailable: %j', async (state) => {
		fixture.postgres = state.postgres;
		fixture.errors = state.errors;
		await load(event());
		expect(load_PostgresQueryStatistics).not.toHaveBeenCalled();
	});
});
