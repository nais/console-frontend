import { PostgresInsightsStore, PostgresQueryStatisticsStore } from '$houdini';
import { createRawSnippet, type ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import Queries from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/queries/+page.svelte';
import PostgresLayout from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/+layout.svelte';

const fixture = vi.hoisted(() => ({
	insights: {},
	statistics: {},
	navigating: { to: null as object | null },
	page: {
		route: { id: '/team/[team]/[env]/postgres/[postgres]/(single)/queries' },
		params: { team: 'test', env: 'dev', postgres: 'database' },
		url: new URL('https://console.test/?branch=main&interval=6h&database=app'),
		data: { interval: '6h' }
	}
}));

vi.mock('$app/state', () => ({
	page: fixture.page,
	navigating: fixture.navigating
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/paths', () => ({
	resolve: (route: string) =>
		route
			.replace('/(single)', '')
			.replace('[team]', 'test')
			.replace('[env]', 'dev')
			.replace('[postgres]', 'database')
}));
vi.mock('$houdini', () => ({
	PostgresInsightsStore: class {
		subscribe = readable(fixture.insights).subscribe;
	},
	PostgresQueryStatisticsStore: class {
		subscribe = readable(fixture.statistics).subscribe;
	}
}));

type Series = {
	labels: { name: string; value: string }[];
	values: { timestamp: Date; value: number }[];
};

function metric(statistic: string, value: number, labels: Record<string, string> = {}): Series {
	return {
		labels: Object.entries({ statistic, ...labels }).map(([name, value]) => ({ name, value })),
		values: [{ timestamp: new Date('2026-11-02T14:00:00Z'), value }]
	};
}

const available = [
	metric('calls_available', 1, { datname: 'app' }),
	metric('seconds_available', 1, { datname: 'app' })
];
const identity = { datname: 'app', user: 'app-readwrite', queryid: '-1002020923924651684' };
const sql = 'SELECT name FROM customers WHERE id = $1';
const activity = [
	...available,
	metric('seconds', 10, identity),
	metric('calls', 5, identity),
	metric('total', 100),
	metric('query', 1, { ...identity, query: sql })
];

async function renderPage({
	series = activity,
	warnings = [],
	errors = null,
	insightErrors = null,
	hasPostgres = true,
	fetching = false
}: {
	series?: Series[];
	warnings?: string[];
	errors?: { message: string }[] | null;
	insightErrors?: { message: string }[] | null;
	hasPostgres?: boolean;
	fetching?: boolean;
} = {}) {
	fixture.insights = {
		errors: insightErrors,
		fetching: false,
		data: {
			team: {
				environment: {
					postgres: hasPostgres ? { id: 'database' } : null
				}
			}
		}
	};
	fixture.statistics = {
		errors,
		fetching,
		data: { environment: { metrics: { series, warnings } } }
	};
	return render(Queries, {
		props: {
			data: {
				PostgresInsights: new PostgresInsightsStore(),
				PostgresQueryStatistics: new PostgresQueryStatisticsStore(),
				interval: '1h',
				collectedAt: new Date('2026-11-02T14:00:00Z')
			} as ComponentProps<typeof Queries>['data'],
			params: { team: 'test', env: 'dev', postgres: 'database' }
		}
	});
}

function renderLayout() {
	return render(PostgresLayout, {
		props: {
			data: { viewerIsMember: false, isAdmin: false } as ComponentProps<
				typeof PostgresLayout
			>['data'],
			params: { team: 'test', env: 'dev', postgres: 'database' },
			children: createRawSnippet(() => ({ render: () => '<div>Content</div>' }))
		}
	});
}

beforeEach(() => {
	fixture.navigating.to = null;
	fixture.page.route.id = '/team/[team]/[env]/postgres/[postgres]/(single)/queries';
	fixture.page.url = new URL('https://console.test/?branch=main&interval=6h&database=app');
	fixture.page.data.interval = '6h';
});

describe('Postgres Queries page', () => {
	test('renders app SQL with accessible statistics and no database selector or column', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('<h1');
		expect(body).toMatch(/<h2\b[^>]*>[\s\S]*?Query statistics[\s\S]*?<\/h2>/);
		expect(body).toContain('class="table-scroll"');
		expect(body).toContain('sorted by total execution time (highest first)');
		expect(body).toContain(sql);
		expect(body).not.toContain(identity.queryid);
		expect(body).not.toContain('Query ID');
		expect(body).toContain('app-readwrite');
		expect(body).toContain('10 s');
		expect(body).toContain('2 s');
		expect(body).toContain('10.0%');
		expect(body).toContain('Exported SQL text is limited to 256 characters');
		expect(body).not.toContain('SQL text unavailable');
		expect(body).toContain('Calls (estimated)');
		expect(body).not.toContain('Branch');
		expect(body).not.toContain('<select');
		expect(body).not.toContain('Load more branches');
		expect(body).not.toMatch(/<label[^>]*>\s*Database<\/label>/);
		expect(body).not.toMatch(/<th\b[^>]*>Database<\/th>/);
		expect(body).not.toContain('All databases');
		expect(body).toContain('Top 20 queries in the app database');
		expect([...body.matchAll(/<th\b/g)]).toHaveLength(6);
		expect(body).toContain('Time period');
	});

	test('does not expose branch selection or pagination', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('<select');
		expect(body).not.toContain('Load more branches');
	});

	test('shows empty activity outside a table', async () => {
		const { body } = await renderPage({ series: available });
		expect(body).toContain('No query activity could be calculated');
		expect(body).not.toContain('<table');
		expect(body).not.toContain('not currently exported');
	});

	test('distinguishes absent metrics from no activity', async () => {
		const { body } = await renderPage({ series: [] });
		expect(body).toContain('not currently exported');
		expect(body).not.toContain('No query activity could be calculated');
	});

	test('surfaces GraphQL failures without showing cached statistics or an empty success state', async () => {
		const { body } = await renderPage({ errors: [{ message: 'Access denied' }] });
		expect(body).toContain('Access denied');
		expect(body).toContain('could not be loaded');
		expect(body).not.toContain('<table');
		expect(body).not.toContain('not currently exported');
	});

	test('shows loading instead of stale rows during navigation', async () => {
		fixture.navigating.to = {};
		const { body } = await renderPage();
		expect(body).toContain('Loading query statistics');
		expect(body).not.toContain('<table');
	});

	test('does not leave an unexecuted metrics store loading after metadata fails', async () => {
		const { body } = await renderPage({
			insightErrors: [{ message: 'Postgres not found' }],
			hasPostgres: false,
			fetching: true
		});
		expect(body).toContain('Postgres not found');
		expect(body).toContain('Query statistics could not be loaded');
		expect(body).not.toContain('Loading query statistics');
	});

	test('does not leave an unexecuted metrics store loading when Postgres is absent', async () => {
		const { body } = await renderPage({ hasPostgres: false, fetching: true });
		expect(body).toContain('Query statistics are not yet available for this Postgres.');
		expect(body).not.toContain('Loading query statistics');
	});

	test('surfaces Prometheus warnings and unavailable partial statistics', async () => {
		const { body } = await renderPage({
			series: [...available, metric('seconds', 10, identity)],
			warnings: ['Partial response']
		});
		expect(body).toContain('Partial response');
		expect(body).toContain('Missing values are shown as N/A');
		expect(body).toContain('N/A');
	});

	test('preserves statistics and explains when SQL metadata is missing', async () => {
		const { body } = await renderPage({
			series: activity.filter(
				(series) =>
					!series.labels.some((label) => label.name === 'statistic' && label.value === 'query')
			)
		});
		expect(body).toContain('SQL text is unavailable for some queries');
		expect(body).toContain('SQL text unavailable');
		expect(body).toContain('10 s');
		expect(body).not.toContain(identity.queryid);
		expect(body).toContain('<table');
	});

	test('renders all distinct SQL variants for the same query identity', async () => {
		const { body } = await renderPage({
			series: [...activity, metric('query', 1, { ...identity, query: 'SELECT $1' })]
		});
		expect(body).toContain('SQL variants');
		expect(body).toContain(sql);
		expect(body).toContain('SELECT $1');
	});

	test('escapes SQL text without rendering it as HTML', async () => {
		const { body } = await renderPage({
			series: [
				...activity.filter(
					(series) =>
						!series.labels.some((label) => label.name === 'statistic' && label.value === 'query')
				),
				metric('query', 1, { ...identity, query: "SELECT '<script>alert(1)</script>'" })
			]
		});
		expect(body).toContain('&lt;script>alert(1)&lt;/script>');
		expect(body).not.toContain('<script>alert(1)</script>');
	});

	test('reports malformed metric labels explicitly', async () => {
		const { body } = await renderPage({ series: [metric('seconds', 1)] });
		expect(body).toContain('missing the database label');
		expect(body).not.toContain('<table');
	});

	test('escapes label content', async () => {
		const { body } = await renderPage({
			series: [...available, metric('seconds', 1, { ...identity, user: '<script>bad</script>' })]
		});
		expect(body).toContain('&lt;script>bad&lt;/script>');
		expect(body).not.toContain('<script>bad</script>');
	});

	test('removes Branches navigation and obsolete branch filters while preserving time', async () => {
		const { body } = await renderLayout();
		expect(body).toContain('>Queries<');
		expect(body).toContain('href="/team/test/dev/postgres/database/queries?interval=6h"');
		expect(body).toContain('href="/team/test/dev/postgres/database/insights?interval=6h"');
		expect(body).not.toContain('>Branches<');
		expect(body).not.toContain('/branches');
		expect(body).not.toContain('branch=preview');
		expect(body).not.toContain('database=app');
		expect(body).not.toContain('>Branches<');
	});

	test.each([
		{ route: 'insights', search: '', interval: '7d' },
		{ route: 'queries', search: '', interval: '1h' },
		{ route: 'insights', search: '?interval=invalid', interval: '7d' },
		{ route: 'queries', search: '?interval=invalid', interval: '1h' }
	])(
		'preserves the effective $interval interval from $route with "$search"',
		async ({ route, search, interval }) => {
			fixture.page.route.id = `/team/[team]/[env]/postgres/[postgres]/(single)/${route}`;
			fixture.page.url = new URL(`https://console.test/${search}`);
			fixture.page.data.interval = interval;

			const { body } = await renderLayout();
			expect(body).toContain(
				`href="/team/test/dev/postgres/database/queries?interval=${interval}"`
			);
			expect(body).toContain(
				`href="/team/test/dev/postgres/database/insights?interval=${interval}"`
			);
			expect(body).not.toContain('interval=invalid');
		}
	);
});
