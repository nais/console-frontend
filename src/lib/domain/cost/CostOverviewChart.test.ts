import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import CostOverviewChart from './CostOverviewChart.svelte';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/') } }));
vi.mock('$houdini', () => ({
	PendingValue: Symbol('PendingValue'),
	graphql: () =>
		readable({
			data: {
				team: {
					environment: {
						environment: { name: 'prod-gcp' },
						workload: {
							cost: {
								daily: {
									series: [
										{
											date: new Date(2026, 10, 1),
											services: [
												{ service: 'Cloud SQL', cost: 1.5 },
												{ service: 'Compute Engine', cost: 0.1 }
											]
										}
									]
								}
							}
						}
					}
				}
			},
			fetching: false
		})
}));

test('delegates the service legend to the chart without adding a static duplicate', async () => {
	const { body } = await render(CostOverviewChart, {
		props: { environment: 'prod-gcp', workload: 'example-app', teamSlug: 'example-team' }
	});

	expect(body).toContain('Cost');
	expect(body).toContain('30d');
	expect(body).not.toMatch(/<div class="legend(?:\s|")/);
});
