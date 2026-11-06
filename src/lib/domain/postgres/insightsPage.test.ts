import { PostgresInsightsStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import Insights from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/insights/+page.svelte';

const fixture = vi.hoisted(() => ({
	activeBranch: { id: 'main', name: 'main' } as { id: string; name: string } | null,
	nodes: [{ id: 'preview', name: 'preview' }],
	totalCount: 2,
	hasNextPage: false,
	url: new URL('https://console.example.com/team/test/dev/postgres/database/insights'),
	metricErrors: [] as { message: string }[]
}));

vi.mock('$app/state', () => ({
	page: {
		params: { team: 'test', env: 'dev', postgres: 'database' },
		get url() {
			return fixture.url;
		}
	}
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/env', () => ({ browser: false }));
vi.mock('$houdini', () => ({
	graphql: () =>
		readable({
			data: fixture.metricErrors.length
				? null
				: { environment: { metrics: { series: [], warnings: [] } } },
			errors: fixture.metricErrors,
			fetching: false
		}),
	PostgresInsightsStore: class {
		subscribe = readable({
			data: {
				team: {
					environment: {
						postgres: {
							id: 'database',
							name: 'database',
							teamEnvironment: { environment: { name: 'dev' } },
							activeBranch: fixture.activeBranch,
							branches: {
								nodes: fixture.nodes,
								pageInfo: {
									totalCount: fixture.totalCount,
									hasNextPage: fixture.hasNextPage
								}
							}
						}
					}
				}
			},
			errors: null,
			fetching: false
		}).subscribe;
	}
}));

async function renderPage() {
	return render(Insights, {
		props: {
			params: { team: 'test', env: 'dev', postgres: 'database' },
			data: {
				PostgresInsights: new PostgresInsightsStore(),
				interval: '7d'
			} as ComponentProps<typeof Insights>['data']
		}
	});
}

describe('Postgres Insights page', () => {
	beforeEach(() => {
		fixture.activeBranch = { id: 'main', name: 'main' };
		fixture.nodes = [{ id: 'preview', name: 'preview' }];
		fixture.totalCount = 2;
		fixture.hasNextPage = false;
		fixture.metricErrors = [];
		fixture.url = new URL('https://console.example.com/team/test/dev/postgres/database/insights');
	});

	test('renders twelve charts under five labelled sections without duplicating the page h1', async () => {
		const { body } = await renderPage();
		expect(body.match(/class="prometheus-chart-wrapper\b/g)).toHaveLength(12);
		expect(body.match(/<h2\b/g)).toHaveLength(5);
		expect(body.match(/<h3\b/g)).toHaveLength(12);
		expect(body).not.toContain('<h1');
		for (const match of body.matchAll(/<section aria-labelledby="([^"]+)"/g)) {
			expect(body).toContain(`id="${match[1]}"`);
		}
		expect(body).toContain('Connections per database');
		expect(body).toContain('Commits and rollbacks per second on the primary');
	});

	test('uses only the active branch without selection or pagination and preserves all time ranges', async () => {
		fixture.url.searchParams.set('branch', 'preview');
		fixture.hasNextPage = true;
		fixture.nodes = [
			{ id: 'main', name: 'main' },
			{ id: 'preview', name: 'preview' }
		];
		const { body } = await renderPage();
		expect(body).not.toContain('<select');
		expect(body).not.toContain('Load more branches');
		expect(body).toContain('branch main');
		expect(body).not.toContain('branch preview');
		for (const interval of ['1h', '6h', '1d', '7d', '30d']) {
			expect(body).toContain(`>${interval}<`);
		}
	});

	test('does not fall back to another branch when there is no active branch', async () => {
		fixture.activeBranch = null;
		const { body } = await renderPage();
		expect(body).toContain('Utilization is not yet available.');
		expect(body).not.toContain('branch preview');
		expect(body).not.toContain('branch main');
		expect(body).not.toContain('prometheus-chart-wrapper');
	});

	test('keeps the existing empty state when there are no branches', async () => {
		fixture.activeBranch = null;
		fixture.nodes = [];
		fixture.totalCount = 0;
		const { body } = await renderPage();
		expect(body).toContain('Utilization is not yet available.');
		expect(body).not.toContain('prometheus-chart-wrapper');
	});

	test('shows metric query errors instead of an indefinite loading or empty-data state', async () => {
		fixture.metricErrors = [{ message: 'Failed to query metrics' }];
		const { body } = await renderPage();
		expect(body).toContain('Failed to query metrics');
		expect(body).not.toContain('prometheus-chart-loading');
		expect(body).not.toContain('No data available');
	});
});
