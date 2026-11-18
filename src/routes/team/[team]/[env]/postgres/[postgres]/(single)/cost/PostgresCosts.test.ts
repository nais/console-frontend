import { render } from 'svelte/server';
import { vi } from 'vitest';
import { euroValueFormatter } from '#lib/utils/formatters.js';
import PostgresCosts from './PostgresCosts.svelte';
import { dailyCostData, monthlyCostData } from './costSeries.js';

vi.mock('$app/navigation', () => ({ goto: vi.fn() }));
vi.mock('$app/state', () => ({ page: { url: new URL('http://localhost/') } }));

const period = {
	interval: '30d' as const,
	from: new Date('2026-10-16'),
	to: new Date('2026-11-15')
};

test('keeps the period selector available when billing data is missing', async () => {
	const { body } = await render(PostgresCosts, {
		props: { ...period, cost: { daily: null, monthly: null } }
	});

	expect(body).toContain('No daily cost data available for this period.');
	expect(body).toContain('No monthly cost data available.');
	for (const interval of ['30d', '90d', '6m', '1y']) {
		expect(body).toContain(`>${interval}<!----></button>`);
	}
	expect(body).not.toContain('Total:');
	expect(body).toContain('delayed by at least two days');
});

test('renders zero billed cost as a total rather than treating it as missing data', async () => {
	const { body } = await render(PostgresCosts, {
		props: {
			...period,
			cost: {
				daily: { sum: 0, series: [] },
				monthly: null
			}
		}
	});

	expect(body).toContain(`<strong>${euroValueFormatter(0)}</strong>`);
	expect(body).toContain('No monthly cost data available.');
});

test('shows actual monthly totals independently of a missing daily period, without extrapolating', async () => {
	const { body } = await render(PostgresCosts, {
		props: {
			...period,
			cost: {
				daily: null,
				monthly: {
					sum: 45,
					series: [
						{ date: new Date('2026-11-15'), sum: 15 },
						{ date: new Date('2026-10-31'), sum: 30 }
					]
				}
			}
		}
	});

	expect(body).toContain('No daily cost data available for this period.');
	expect(body).not.toContain('No monthly cost data available.');
	expect(body).toContain(`<strong>${euroValueFormatter(45)}</strong>`);
	expect(body).toContain('Monthly totals may be incomplete.');
	expect(body).not.toContain('<table');
	expect(body).not.toContain('Monthly cost data');
	expect(body).not.toContain('Daily cost data');
});

test('fills every missing day in the selected UTC period with zero for each service', () => {
	expect(
		dailyCostData(
			{
				sum: 6,
				series: [
					{
						date: new Date('2026-03-29'),
						sum: 4,
						services: [{ service: 'Compute', cost: 4 }]
					},
					{
						date: new Date('2026-03-27'),
						sum: 2,
						services: [{ service: 'Storage', cost: 2 }]
					}
				]
			},
			new Date('2026-03-26'),
			new Date('2026-03-30')
		)
	).toEqual([
		{ date: new Date('2026-03-26'), Compute: 0, Storage: 0 },
		{ date: new Date('2026-03-27'), Compute: 0, Storage: 2 },
		{ date: new Date('2026-03-28'), Compute: 0, Storage: 0 },
		{ date: new Date('2026-03-29'), Compute: 4, Storage: 0 },
		{ date: new Date('2026-03-30'), Compute: 0, Storage: 0 }
	]);
});

test('fills missing months across a year boundary without estimating partial months', () => {
	expect(
		monthlyCostData({
			sum: 45,
			series: [
				{ date: new Date('2026-02-15'), sum: 15 },
				{ date: new Date('2025-11-30'), sum: 30 }
			]
		})
	).toEqual([
		{ date: new Date('2025-11-01'), Total: 30 },
		{ date: new Date('2025-12-01'), Total: 0 },
		{ date: new Date('2026-01-01'), Total: 0 },
		{ date: new Date('2026-02-01'), Total: 15 }
	]);
});

test('does not manufacture zero-cost series when the entire period has no data', () => {
	expect(dailyCostData(null, period.from, period.to)).toEqual([]);
	expect(dailyCostData({ sum: 0, series: [] }, period.from, period.to)).toEqual([]);
	expect(monthlyCostData(null)).toEqual([]);
	expect(monthlyCostData({ sum: 0, series: [] })).toEqual([]);
});
