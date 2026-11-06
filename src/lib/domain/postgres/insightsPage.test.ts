import { PostgresInsightsStore } from '$houdini';
import type { ComponentProps } from 'svelte';
import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import Insights from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/insights/+page.svelte';

const fixture = vi.hoisted(() => ({
	metricErrors: [] as { message: string }[]
}));

vi.mock('$app/state', () => ({
	page: {
		params: { team: 'test', env: 'dev', postgres: 'database' },
		url: new URL('https://console.example.com/team/test/dev/postgres/database/insights')
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
							teamEnvironment: { environment: { name: 'dev' } }
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
		fixture.metricErrors = [];
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

	test('preserves all time ranges without branch selection or pagination', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('<select');
		expect(body).not.toContain('Load more branches');
		for (const interval of ['1h', '6h', '1d', '7d', '30d']) {
			expect(body).toContain(`>${interval}<`);
		}
	});

	test('renders historical main metrics without a branch resource', async () => {
		const { body } = await renderPage();
		expect(body).not.toContain('branch preview');
		expect(body).toContain('branch main');
		expect(body.match(/class="prometheus-chart-wrapper\b/g)).toHaveLength(12);
	});

	test('shows metric query errors instead of an indefinite loading or empty-data state', async () => {
		fixture.metricErrors = [{ message: 'Failed to query metrics' }];
		const { body } = await renderPage();
		expect(body).toContain('Failed to query metrics');
		expect(body).not.toContain('prometheus-chart-loading');
		expect(body).not.toContain('No data available');
	});
});
