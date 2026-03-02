import { countIssuesBySeverity } from './issueCounts';

describe('countIssuesBySeverity', () => {
	test('returns 0 when edges are undefined', () => {
		expect(countIssuesBySeverity(undefined, 'TODO')).toBe(0);
	});

	test('returns 0 when edges are null', () => {
		expect(countIssuesBySeverity(null, 'TODO')).toBe(0);
	});

	test('counts matching severities', () => {
		const edges = [
			{ node: { severity: 'TODO' } },
			{ node: { severity: 'WARNING' } },
			{ node: { severity: 'TODO' } },
			{ node: { severity: 'CRITICAL' } }
		];

		expect(countIssuesBySeverity(edges, 'TODO')).toBe(2);
		expect(countIssuesBySeverity(edges, 'WARNING')).toBe(1);
		expect(countIssuesBySeverity(edges, 'CRITICAL')).toBe(1);
	});

	test('ignores null edges and nodes', () => {
		const edges = [null, { node: null }, { node: { severity: 'TODO' } }];

		expect(countIssuesBySeverity(edges, 'TODO')).toBe(1);
	});
});
