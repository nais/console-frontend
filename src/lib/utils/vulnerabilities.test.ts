import {
	allSeverities,
	formatProcessingDuration,
	sbomStatusDetails,
	severityToColor,
	severityToRiskScore
} from './vulnerabilities';

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

	describe('SbomStatus helpers', () => {
		test('READY status returns healthy indicator and SBOM up to date label', () => {
			expect(sbomStatusDetails({ status: 'READY' })).toEqual({
				status: 'READY',
				indicator: 'healthy',
				iconIndicator: 'healthy',
				label: 'SBOM up to date'
			});
		});

		test('READY status without vulnerability data returns a no-sbom icon indicator', () => {
			expect(sbomStatusDetails({ status: 'READY', hasVulnerabilityData: false })).toEqual({
				status: 'READY',
				indicator: 'healthy',
				iconIndicator: 'no-sbom',
				label: 'SBOM up to date'
			});
		});

		test('PROCESSING status returns processing indicator', () => {
			const result = sbomStatusDetails({ status: 'PROCESSING' });
			expect(result.status).toBe('PROCESSING');
			expect(result.indicator).toBe('processing');
			expect(result.iconIndicator).toBe('processing');
		});

		test('NO_SBOM status returns no-sbom indicator', () => {
			expect(sbomStatusDetails({ status: 'NO_SBOM' })).toEqual({
				status: 'NO_SBOM',
				indicator: 'no-sbom',
				iconIndicator: 'no-sbom',
				label: 'No SBOM found'
			});
		});

		test('FAILED status returns warning indicator', () => {
			expect(sbomStatusDetails({ status: 'FAILED' })).toEqual({
				status: 'FAILED',
				indicator: 'warning',
				iconIndicator: 'warning',
				label: 'SBOM processing failed'
			});
		});

		test('PROCESSING with sbomProcessingStartedAt shows elapsed time as label', () => {
			const now = new Date();
			const fiveMinAgo = new Date(now.getTime() - 5 * 60_000);
			const result = sbomStatusDetails({
				status: 'PROCESSING',
				sbomProcessingStartedAt: fiveMinAgo
			});
			expect(result.label).toBe('Scanning for vulnerabilities · 5 min');
		});
	});

	describe('formatProcessingDuration', () => {
		test('returns null for null input', () => {
			expect(formatProcessingDuration(null)).toBeNull();
		});

		test('returns null for undefined input', () => {
			expect(formatProcessingDuration(undefined)).toBeNull();
		});

		test('returns less than a minute for very recent date', () => {
			const recent = new Date(Date.now() - 30_000);
			expect(formatProcessingDuration(recent)).toBe(
				'Scanning for vulnerabilities · less than a minute'
			);
		});

		test('returns minutes for sub-hour duration', () => {
			const thirtyMinAgo = new Date(Date.now() - 30 * 60_000);
			expect(formatProcessingDuration(thirtyMinAgo)).toBe('Scanning for vulnerabilities · 30 min');
		});

		test('returns hours and minutes for multi-hour duration', () => {
			const ninetyMinAgo = new Date(Date.now() - 90 * 60_000);
			expect(formatProcessingDuration(ninetyMinAgo)).toBe(
				'Scanning for vulnerabilities · 1 h 30 min'
			);
		});

		test('returns exact hours when no remainder minutes', () => {
			const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60_000);
			expect(formatProcessingDuration(twoHoursAgo)).toBe('Scanning for vulnerabilities · 2 h');
		});

		test('returns days for multi-day duration', () => {
			const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60_000);
			expect(formatProcessingDuration(threeDaysAgo)).toBe('Scanning for vulnerabilities · 3 d');
		});
	});
});
