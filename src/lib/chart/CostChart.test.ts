import { getEstimateForMonth } from './CostChart.svelte';

describe('CostChart', () => {
	describe('getEstimateForMonth', () => {
		test('estimates full month cost from partial data', () => {
			// If we have 10 days of data showing €100, estimate for 30-day month
			const date = new Date('2025-11-10'); // 10th day of November
			const cost = 100;
			const estimate = getEstimateForMonth(cost, date);

			// 100 / 10 days = €10/day * 30 days = €300
			expect(estimate).toBe(300);
		});

		test('estimates for 31-day month', () => {
			// January has 31 days
			const date = new Date('2025-01-10'); // 10 days of data
			const cost = 100;
			const estimate = getEstimateForMonth(cost, date);

			// 100 / 10 = €10/day * 31 days = €310
			expect(estimate).toBe(310);
		});

		test('estimates for 28-day month (non-leap year)', () => {
			// February 2025 has 28 days (not a leap year)
			const date = new Date('2025-02-14'); // 14 days of data
			const cost = 140;
			const estimate = getEstimateForMonth(cost, date);

			// 140 / 14 = €10/day * 28 days = €280
			expect(estimate).toBe(280);
		});

		test('estimates for 29-day month (leap year)', () => {
			// February 2024 has 29 days (leap year)
			const date = new Date('2024-02-14'); // 14 days of data
			const cost = 140;
			const estimate = getEstimateForMonth(cost, date);

			// 140 / 14 = €10/day * 29 days = €290
			expect(estimate).toBe(290);
		});

		test('handles first day of month', () => {
			const date = new Date('2025-11-01'); // 1 day of data
			const cost = 10;
			const estimate = getEstimateForMonth(cost, date);

			// 10 / 1 = €10/day * 30 days = €300
			expect(estimate).toBe(300);
		});

		test('handles last day of month', () => {
			const date = new Date('2025-11-30'); // Full month of data
			const cost = 300;
			const estimate = getEstimateForMonth(cost, date);

			// 300 / 30 = €10/day * 30 days = €300 (no change)
			expect(estimate).toBe(300);
		});

		test('handles zero cost', () => {
			const date = new Date('2025-11-15');
			const cost = 0;
			const estimate = getEstimateForMonth(cost, date);

			expect(estimate).toBe(0);
		});

		test('handles fractional costs', () => {
			const date = new Date('2025-11-10'); // 10 days
			const cost = 123.45;
			const estimate = getEstimateForMonth(cost, date);

			// 123.45 / 10 = 12.345/day * 30 days = 370.35
			expect(estimate).toBeCloseTo(370.35, 2);
		});

		test('real-world scenario: mid-month estimate', () => {
			// It's November 15th, we've spent €450 so far
			const date = new Date('2025-11-15');
			const cost = 450;
			const estimate = getEstimateForMonth(cost, date);

			// 450 / 15 = €30/day * 30 days = €900 estimated total
			expect(estimate).toBe(900);
		});

		test('real-world scenario: early month spike', () => {
			// High cost on day 2 should project high monthly cost
			const date = new Date('2025-11-02');
			const cost = 100;
			const estimate = getEstimateForMonth(cost, date);

			// 100 / 2 = €50/day * 30 days = €1500
			expect(estimate).toBe(1500);
		});

		test('different months have different day counts', () => {
			const cost = 100;
			const day = 10;

			// January (31 days)
			const jan = getEstimateForMonth(cost, new Date(`2025-01-${day}`));
			// February (28 days in 2025)
			const feb = getEstimateForMonth(cost, new Date(`2025-02-${day}`));
			// April (30 days)
			const apr = getEstimateForMonth(cost, new Date(`2025-04-${day}`));

			expect(jan).toBe(310); // 100/10 * 31
			expect(feb).toBe(280); // 100/10 * 28
			expect(apr).toBe(300); // 100/10 * 30
		});
	});
});
