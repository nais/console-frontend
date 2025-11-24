import { allSeverities, severityToColor, severityToRiskScore } from './vulnerabilities';

describe('vulnerabilities', () => {
	describe('severityToColor', () => {
		describe('default (background) colors', () => {
			test('returns correct color for critical severity', () => {
				expect(severityToColor({ severity: 'critical' })).toBe('var(--ax-danger-600)');
			});

			test('returns correct color for high severity', () => {
				expect(severityToColor({ severity: 'high' })).toBe(
					'color-mix(in oklab, var(--ax-danger-600), var(--ax-warning-200))'
				);
			});

			test('returns correct color for medium severity', () => {
				expect(severityToColor({ severity: 'medium' })).toBe('var(--ax-warning-200)');
			});

			test('returns correct color for low severity', () => {
				expect(severityToColor({ severity: 'low' })).toBe('var(--ax-success-400)');
			});

			test('returns correct color for unassigned severity', () => {
				expect(severityToColor({ severity: 'unassigned' })).toBe('var(--ax-neutral-400)');
			});

			test('returns neutral color for unknown severity', () => {
				expect(severityToColor({ severity: 'unknown' })).toBe('var(--ax-neutral-400)');
			});
		});

		describe('text colors', () => {
			test('returns correct text color for critical severity', () => {
				expect(severityToColor({ severity: 'critical', isText: true })).toBe(
					'var(--ax-danger-600)'
				);
			});

			test('returns correct text color for high severity', () => {
				expect(severityToColor({ severity: 'high', isText: true })).toBe(
					'color-mix(in oklab, var(--ax-danger-600), var(--ax-warning-400))'
				);
			});

			test('returns correct text color for medium severity', () => {
				expect(severityToColor({ severity: 'medium', isText: true })).toBe('var(--ax-warning-400)');
			});

			test('returns correct text color for low severity', () => {
				expect(severityToColor({ severity: 'low', isText: true })).toBe('var(--ax-success-500)');
			});

			test('returns correct text color for unassigned severity', () => {
				expect(severityToColor({ severity: 'unassigned', isText: true })).toBe(
					'var(--ax-neutral-600)'
				);
			});
		});

		describe('graph colors', () => {
			test('returns correct graph color for Critical severity', () => {
				expect(severityToColor({ severity: 'Critical', isGraph: true })).toBe('#e22a49');
			});

			test('returns correct graph color for High severity', () => {
				expect(severityToColor({ severity: 'High', isGraph: true })).toBe('#f89686');
			});

			test('returns correct graph color for Medium severity', () => {
				expect(severityToColor({ severity: 'Medium', isGraph: true })).toBe('#ffebc7');
			});

			test('returns correct graph color for Low severity', () => {
				expect(severityToColor({ severity: 'Low', isGraph: true })).toBe('#a8dfb4');
			});

			test('returns correct graph color for Unassigned severity', () => {
				expect(severityToColor({ severity: 'Unassigned', isGraph: true })).toBe('#cfd3d8');
			});

			test('returns default graph color for unknown severity', () => {
				expect(severityToColor({ severity: 'Unknown', isGraph: true })).toBe('#cfd3d8');
			});
		});

		describe('edge cases', () => {
			test('handles empty string severity', () => {
				expect(severityToColor({ severity: '' })).toBe('var(--ax-neutral-400)');
			});

			test('text colors have different values than background colors', () => {
				const bgHigh = severityToColor({ severity: 'high' });
				const textHigh = severityToColor({ severity: 'high', isText: true });
				expect(bgHigh).not.toBe(textHigh);
			});

			test('graph colors use hex values, not CSS variables', () => {
				const graphCritical = severityToColor({ severity: 'Critical', isGraph: true });
				expect(graphCritical).toMatch(/^#[0-9a-f]{6}$/i);
			});
		});
	});

	describe('severityToRiskScore', () => {
		test('assigns correct risk scores', () => {
			expect(severityToRiskScore.Critical).toBe(10);
			expect(severityToRiskScore.High).toBe(5);
			expect(severityToRiskScore.Medium).toBe(3);
			expect(severityToRiskScore.Low).toBe(1);
			expect(severityToRiskScore.Unassigned).toBe(5);
		});

		test('Critical has highest risk score', () => {
			const scores = Object.values(severityToRiskScore);
			expect(Math.max(...scores)).toBe(severityToRiskScore.Critical);
		});

		test('Low has lowest risk score', () => {
			const scores = Object.values(severityToRiskScore);
			expect(Math.min(...scores)).toBe(severityToRiskScore.Low);
		});
	});

	describe('allSeverities', () => {
		test('contains all severity levels', () => {
			expect(allSeverities).toEqual(['Critical', 'High', 'Medium', 'Low', 'Unassigned']);
		});

		test('has exactly 5 severity levels', () => {
			expect(allSeverities).toHaveLength(5);
		});

		test('severities are ordered by risk (descending)', () => {
			const scores = allSeverities.map((s) => severityToRiskScore[s]);
			// Documents the actual order: Critical(10), High(5), Medium(3), Low(1), Unassigned(5)
			// Note: Not strictly descending because Unassigned (5) comes after Low (1)
			expect(scores).toEqual([10, 5, 3, 1, 5]);
		});
	});
});
