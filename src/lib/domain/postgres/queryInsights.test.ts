import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
import { LanguageType, promQLLanguage } from '@prometheus-io/codemirror-promql';
import { postgresQueryInsightsQuery, queryDuration, queryInsightsResult } from './queryInsights.js';

function metric(statistic: string, value: number, labels: Record<string, string> = {}) {
	return {
		labels: Object.entries({ statistic, ...labels }).map(([name, value]) => ({ name, value })),
		values: [{ value }]
	};
}

const identity = { datname: 'app', user: 'readwrite', queryid: '-1002020923924651684' };
const availability = [
	metric('calls_available', 10, { datname: 'app' }),
	metric('seconds_available', 10, { datname: 'app' })
];

describe('Postgres query insights PromQL', () => {
	test.each(Object.values(PrometheusChartQueryInterval))(
		'builds valid PromQL for %s with escaped selectors',
		(interval) => {
			const query = postgresQueryInsightsQuery('a"b', 'c\\d', interval);
			const errors: string[] = [];
			promQLLanguage(LanguageType.PromQL)
				.parser.parse(query)
				.iterate({
					enter(node) {
						if (node.type.isError) errors.push(`${node.from}:${node.to}`);
					}
				});
			expect(errors).toEqual([]);
			expect(query).toContain('namespace="a\\"b"');
			expect(query).toContain('team="a\\"b"');
			expect(query).toContain('postgres="c\\\\d"');
			expect(query).not.toContain('branch=');
			expect(query).toContain('datname="app"');
			expect(query).toContain(`[${interval}]`);
		}
	);

	test('calculates counter increases before deduplicating scrapes and summing instances', () => {
		const query = postgresQueryInsightsQuery('team', 'database', '1h');
		expect(query).toContain(
			'sum by (datname,user,queryid) (max by (namespace,k8s_cluster_name,pod,datname,user,queryid) (increase(cnpg_pg_stat_statements_seconds_total{'
		);
		expect(query).toContain('increase(cnpg_pg_stat_statements_calls_total{');
		expect(query).toContain('topk(20,');
		expect(query).toContain('and on (datname,user,queryid)');
		expect(query).toContain('"statistic", "total"');
		expect(query).not.toContain('pg_stat_statements_query_id');
	});

	test('scopes every counter, SQL metadata and availability selector to app before ranking and summing', () => {
		const query = postgresQueryInsightsQuery('team', 'database', '1d');
		const selectors = [...query.matchAll(/cnpg_pg_stat_statements_\w+\{([^}]+)\}/g)];
		expect(selectors.length).toBeGreaterThan(0);
		for (const [, selector] of selectors) {
			expect(selector).toBe('namespace="team",team="team",postgres="database",datname="app"');
		}
		expect(query).toContain(
			'count by (datname) (cnpg_pg_stat_statements_calls_total{namespace="team",team="team",postgres="database",datname="app"})'
		);
		expect(query).toContain('label_replace(sum(sum by (datname,user,queryid)');
		expect(query).toContain('postgres="database",datname="app"}[1d]');
	});

	test('loads SQL metadata for the same scope and top queries without dropping text variants', () => {
		const query = postgresQueryInsightsQuery('team', 'database', '1d');
		expect(query).toContain(
			'group by (datname,user,queryid,query) (cnpg_pg_stat_statements_queries_info{namespace="team",team="team",postgres="database",datname="app"}) and on (datname,user,queryid) (topk(20,'
		);
		expect(query).toContain('"statistic", "query"');
	});
});

describe('Postgres query insights results', () => {
	test('joins unordered statistics and uses the full total, not just the top queries', () => {
		const result = queryInsightsResult([
			...availability,
			metric('calls', 2.5, identity),
			metric('total', 100),
			metric('seconds', 10, identity)
		]);
		expect(result.error).toBeNull();
		expect(result.available).toBe(true);
		expect(result.rows).toEqual([
			{
				key: JSON.stringify(['app', 'readwrite', identity.queryid]),
				database: 'app',
				user: 'readwrite',
				queryId: identity.queryid,
				queryTexts: [],
				calls: 2.5,
				seconds: 10,
				meanSeconds: 4,
				share: 0.1
			}
		]);
	});

	test('keeps query IDs as strings and separates users and databases', () => {
		const otherUser = { ...identity, user: 'readonly' };
		const otherDatabase = { ...identity, datname: 'other' };
		const result = queryInsightsResult([
			...availability,
			metric('seconds', 2, identity),
			metric('seconds', 8, otherUser),
			metric('seconds', 3, otherDatabase),
			metric('calls', 4, otherUser)
		]);
		expect(result.rows.map((row) => [row.database, row.user, row.queryId])).toEqual([
			['app', 'readonly', identity.queryid],
			['other', 'readwrite', identity.queryid],
			['app', 'readwrite', identity.queryid]
		]);
		expect(result.rows[0].meanSeconds).toBe(2);
		expect(result.rows[1].calls).toBeNull();
	});

	test('joins SQL text regardless of response order using database, user and query ID', () => {
		const result = queryInsightsResult([
			metric('query', 1, { ...identity, query: 'SELECT $1' }),
			metric('query', 1, { ...identity, user: 'another-user', query: 'SELECT $2' }),
			metric('query', 1, { ...identity, datname: 'other', query: 'SELECT $3' }),
			metric('query', 1, { ...identity, queryid: 'another-id', query: 'SELECT $4' }),
			metric('seconds', 10, identity)
		]);
		expect(result.error).toBeNull();
		expect(result.rows).toHaveLength(1);
		expect(result.rows[0].queryTexts).toEqual(['SELECT $1']);
		expect(result.rows[0].seconds).toBe(10);
	});

	test('deduplicates SQL from multiple instances and preserves distinct text variants', () => {
		const result = queryInsightsResult([
			metric('seconds', 10, identity),
			metric('query', 1, { ...identity, query: 'SELECT $2' }),
			metric('query', 1, { ...identity, query: 'SELECT $1' }),
			metric('query', 1, { ...identity, query: 'SELECT $2' })
		]);
		expect(result.rows[0].queryTexts).toEqual(['SELECT $1', 'SELECT $2']);
	});

	test('keeps statistics without SQL text and does not fabricate rows from metadata alone', () => {
		expect(queryInsightsResult([metric('seconds', 10, identity)]).rows[0].queryTexts).toEqual([]);
		expect(
			queryInsightsResult([metric('query', 1, { ...identity, query: 'SELECT $1' })]).rows
		).toEqual([]);
	});

	test.each([undefined, '', '   '])('reports missing SQL text in metadata: %s', (query) => {
		const labels = query === undefined ? identity : { ...identity, query };
		expect(queryInsightsResult([metric('query', 1, labels)]).error).toBe(
			'Query text metadata is missing SQL text.'
		);
	});

	test('distinguishes no calculated activity from missing exported metrics', () => {
		expect(queryInsightsResult(availability)).toMatchObject({
			available: true,
			rows: [],
			error: null
		});
		expect(queryInsightsResult([])).toMatchObject({ available: false, rows: [], error: null });
		expect(queryInsightsResult([availability[0]])).toMatchObject({ available: false });
	});

	test('does not report internal-database exports as available app statistics', () => {
		const result = queryInsightsResult([
			metric('calls_available', 1, { datname: 'postgres' }),
			metric('seconds_available', 1, { datname: 'postgres' })
		]);
		expect(result.available).toBe(false);
	});

	test('does not pair availability from unrelated databases', () => {
		const result = queryInsightsResult([
			metric('calls_available', 1, { datname: 'app' }),
			metric('seconds_available', 1, { datname: 'other' })
		]);
		expect(result.available).toBe(false);
	});

	test('retains historical activity even when the source series have been evicted', () => {
		const result = queryInsightsResult([metric('seconds', 10, identity)]);
		expect(result.available).toBe(true);
		expect(result.rows).toHaveLength(1);
	});

	test.each([NaN, Infinity, -1])('reports invalid metric values: %s', (value) => {
		expect(queryInsightsResult([metric('seconds', value, identity)]).error).toBeTruthy();
	});

	test('reports missing labels rather than silently dropping rows', () => {
		expect(queryInsightsResult([metric('seconds', 1)]).error).toBeTruthy();
		expect(queryInsightsResult([metric('seconds', 1, { datname: 'app' })]).error).toBeTruthy();
		expect(queryInsightsResult([metric('unknown', 1, identity)]).error).toBeTruthy();
	});

	test('does not fabricate call counts, averages or shares', () => {
		const result = queryInsightsResult([
			metric('seconds', 10, identity),
			metric('calls', 0, identity),
			metric('total', 0)
		]);
		expect(result.rows[0]).toMatchObject({ calls: 0, meanSeconds: null, share: null });
	});

	test.each([
		[0, '0 ms'],
		[0.0001, '<1 ms'],
		[0.0025, '2.5 ms'],
		[0.5, '500.0 ms'],
		[2.5, '2.5 s'],
		[1000, '1,000 s']
	])('formats %s seconds as %s', (seconds, expected) => {
		expect(queryDuration(seconds)).toBe(expected);
	});
});
