import { render } from 'svelte/server';
import { describe, expect, test } from 'vitest';
import PriorityAlertBar from '../domain/vulnerability/PriorityAlertBar.svelte';
import { calculateSegmentWidths } from './priorityBar';

describe('PriorityAlertBar guidance', () => {
	test.each([false, true])('keeps KEV separate from priority (compact: %s)', async (compact) => {
		const { body } = await render(PriorityAlertBar, {
			props: { knownExploited: 1, high: 3, elevated: 0, monitor: 2, compact }
		});

		expect(body).toMatch(/Use operational priority to decide what to address\s+first\./);
		expect(body).not.toContain('before anything else');
		expect(body).toContain('What does known exploited mean?');
		expect(body).toContain('https://www.cisa.gov/known-exploited-vulnerabilities-catalog');
		expect(body).toContain('https://github.com/enisaeu/CNW/blob/main/advisories/eukev/README.md');
	});

	test.each([false, true])(
		'shows separate concise signals when urgent (compact: %s)',
		async (compact) => {
			const { body } = await render(PriorityAlertBar, {
				props: {
					knownExploited: 4,
					urgentCount: 2,
					high: 6,
					elevated: 3,
					monitor: 352,
					compact
				}
			});

			expect(body).toMatch(/4<\/span>.*Known exploited/);
			expect(body).toMatch(/2<\/span>.*Urgent · internet-facing/);
			expect(body).toMatch(/Urgent findings affect\s+internet-facing workloads\./);
			expect(body).not.toContain('These known exploited findings include');
			expect(body).toContain('6</span>');
			expect(body).toContain('>High</span>');
			expect(body).toContain('>Elevated</span>');
			expect(body).toContain('>Monitor</span>');
		}
	);
});

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
