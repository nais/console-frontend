import { render } from 'svelte/server';
import { vi } from 'vitest';
import { euroValueFormatter } from '#lib/utils/formatters.js';
import PostgresCosts from './PostgresCosts.svelte';

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
});
