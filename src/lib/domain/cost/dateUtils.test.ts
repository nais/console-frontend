import { subDays, subMonths, subYears } from 'date-fns';
import { getFromForCost, getFromForTenantCost } from './dateUtils';

describe('cost/dateUtils', () => {
	describe('getFromForCost', () => {
		const referenceDate = new Date('2025-11-24T12:00:00Z');

		test('returns date 30 days ago for 30d interval', () => {
			const result = getFromForCost('30d', referenceDate);
			const expected = subDays(referenceDate, 30);
			expect(result).toEqual(expected);
		});

		test('returns date 90 days ago for 90d interval', () => {
			const result = getFromForCost('90d', referenceDate);
			const expected = subDays(referenceDate, 90);
			expect(result).toEqual(expected);
		});

		test('returns date 6 months ago for 6m interval', () => {
			const result = getFromForCost('6m', referenceDate);
			const expected = subMonths(referenceDate, 6);
			expect(result).toEqual(expected);
		});

		test('returns date 1 year ago for 1y interval', () => {
			const result = getFromForCost('1y', referenceDate);
			const expected = subYears(referenceDate, 1);
			expect(result).toEqual(expected);
		});

		test('defaults to 30 days for unknown interval', () => {
			const result = getFromForCost('unknown' as unknown as '30d', referenceDate);
			const expected = subDays(referenceDate, 30);
			expect(result).toEqual(expected);
		});
		test('uses current date when to parameter is omitted', () => {
			const before = new Date();
			const result = getFromForCost('30d');
			const after = new Date();

			// Result should be approximately 30 days before now
			const expectedMin = subDays(after, 30);
			const expectedMax = subDays(before, 30);

			expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime() - 1000);
			expect(result.getTime()).toBeLessThanOrEqual(expectedMax.getTime() + 1000);
		});

		test('handles leap year correctly for 1y interval', () => {
			// From Feb 29, 2024 (leap year) back 1 year
			const leapYearDate = new Date('2024-02-29T12:00:00Z');
			const result = getFromForCost('1y', leapYearDate);
			const expected = subYears(leapYearDate, 1);
			expect(result).toEqual(expected);
		});

		test('returns dates in the past', () => {
			const now = new Date();
			const intervals = ['30d', '90d', '6m', '1y'] as const;

			intervals.forEach((interval) => {
				const result = getFromForCost(interval, now);
				expect(result.getTime()).toBeLessThan(now.getTime());
			});
		});
	});

	describe('getFromForTenantCost', () => {
		const referenceDate = new Date('2025-11-24T12:00:00Z');

		test('returns date 6 months ago for 6m interval', () => {
			const result = getFromForTenantCost('6m', referenceDate);
			const expected = subMonths(referenceDate, 6);
			expect(result).toEqual(expected);
		});

		test('returns date 1 year ago for 1y interval', () => {
			const result = getFromForTenantCost('1y', referenceDate);
			const expected = subYears(referenceDate, 1);
			expect(result).toEqual(expected);
		});

		test('returns date 3 years ago for 3y interval', () => {
			const result = getFromForTenantCost('3y', referenceDate);
			const expected = subYears(referenceDate, 3);
			expect(result).toEqual(expected);
		});

		test('returns date 5 years ago for 5y interval', () => {
			const result = getFromForTenantCost('5y', referenceDate);
			const expected = subYears(referenceDate, 5);
			expect(result).toEqual(expected);
		});

		test('defaults to 6 months for unknown interval', () => {
			const result = getFromForTenantCost('unknown' as unknown as '6m', referenceDate);
			const expected = subMonths(referenceDate, 6);
			expect(result).toEqual(expected);
		});
		test('uses current date when to parameter is omitted', () => {
			const before = new Date();
			const result = getFromForTenantCost('1y');
			const after = new Date();

			// Result should be approximately 1 year before now
			const expectedMin = subYears(after, 1);
			const expectedMax = subYears(before, 1);

			expect(result.getTime()).toBeGreaterThanOrEqual(expectedMin.getTime() - 1000);
			expect(result.getTime()).toBeLessThanOrEqual(expectedMax.getTime() + 1000);
		});

		test('tenant cost intervals span longer periods than app cost', () => {
			const now = new Date();

			// TenantCost supports 5y, AppCost max is 1y
			const tenantMax = getFromForTenantCost('5y', now);
			const appMax = getFromForCost('1y', now);

			expect(tenantMax.getTime()).toBeLessThan(appMax.getTime());
		});

		test('returns dates in the past', () => {
			const now = new Date();
			const intervals = ['6m', '1y', '3y', '5y'] as const;

			intervals.forEach((interval) => {
				const result = getFromForTenantCost(interval, now);
				expect(result.getTime()).toBeLessThan(now.getTime());
			});
		});
	});

	describe('interval comparison', () => {
		test('tenant cost default matches app cost default period', () => {
			const referenceDate = new Date('2025-11-24T12:00:00Z');

			// Both default to looking back a certain period
			const tenantDefault = getFromForTenantCost('unknown' as unknown as '6m', referenceDate);
			const appDefault = getFromForCost('unknown' as unknown as '30d', referenceDate); // Tenant defaults to 6m, app defaults to 30d
			expect(tenantDefault.getTime()).toBeLessThan(appDefault.getTime());
		});
	});
});
