import { describe, expect, test } from 'vitest';
import { calculateSegmentWidths } from './priorityBar';

describe('calculateSegmentWidths', () => {
	test('returns all zeros when total is zero', () => {
		expect(calculateSegmentWidths([0, 0, 0])).toEqual([0, 0, 0]);
	});

	test('splits evenly when counts are equal', () => {
		const widths = calculateSegmentWidths([10, 10, 10]);
		widths.forEach((w) => expect(w).toBeCloseTo(100 / 3));
	});

	test('gives a small non-zero segment a minimum visible width', () => {
		const [high, elevated, monitor] = calculateSegmentWidths([1, 0, 999]);
		expect(elevated).toBe(0);
		expect(high).toBeGreaterThanOrEqual(8);
		expect(monitor).toBeGreaterThan(high);
		expect(high + monitor).toBeCloseTo(100);
	});

	test('falls back to raw proportions when minimums would overflow', () => {
		// 20 non-zero segments * 8% minimum = 160% > 100%, must fall back to raw.
		const counts = Array.from({ length: 20 }, () => 1);
		const widths = calculateSegmentWidths(counts);
		widths.forEach((w) => expect(w).toBeCloseTo(5));
	});

	test('one dominant category still sums to ~100', () => {
		const widths = calculateSegmentWidths([0, 0, 42]);
		expect(widths[2]).toBeCloseTo(100);
	});
});
