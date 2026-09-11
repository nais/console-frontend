// Minimum visible width (in %) for any non-zero segment, so a small count
// never disappears next to a much larger one in the priority alert bar.
const MIN_SEGMENT_PERCENT = 8;

/**
 * Computes proportional widths (in %, summing to ~100 when total > 0) for a
 * set of counts, guaranteeing every non-zero count a minimum visible width.
 * Falls back to raw proportions if there are too many non-zero segments to
 * apply the minimum without exceeding 100%.
 */
export function calculateSegmentWidths(counts: number[]): number[] {
	const total = counts.reduce((sum, c) => sum + c, 0);
	if (total === 0) return counts.map(() => 0);

	const raw = counts.map((c) => (c / total) * 100);
	const nonZeroCount = raw.filter((v) => v > 0).length;
	const flooredTotal = nonZeroCount * MIN_SEGMENT_PERCENT;

	if (flooredTotal >= 100 || flooredTotal === 0) {
		return raw;
	}

	const remaining = 100 - flooredTotal;
	return raw.map((v) => (v > 0 ? MIN_SEGMENT_PERCENT + (v / 100) * remaining : 0));
}
