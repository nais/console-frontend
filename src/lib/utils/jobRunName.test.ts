import { describe, expect, it, vi } from 'vitest';
import { generateJobRunName } from './jobRunName';

describe('generateJobRunName', () => {
	const mockDate = new Date('2026-02-12T14:30:15');

	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(mockDate);
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('generates name with timestamp for simple job name', () => {
		const result = generateJobRunName('my-job');
		expect(result).toBe('my-job-20260212-143015');
	});

	it('converts uppercase to lowercase', () => {
		const result = generateJobRunName('MyJob');
		expect(result).toBe('myjob-20260212-143015');
	});

	it('replaces invalid characters with hyphens', () => {
		const result = generateJobRunName('my_job@test');
		expect(result).toBe('my-job-test-20260212-143015');
	});

	it('removes leading hyphens from sanitized name', () => {
		const result = generateJobRunName('---job');
		expect(result).toBe('job-20260212-143015');
	});

	it('removes trailing hyphens from sanitized name', () => {
		const result = generateJobRunName('job---');
		expect(result).toBe('job-20260212-143015');
	});

	it('truncates long job names to fit within 63 chars', () => {
		const longName = 'very-long-job-name-that-exceeds-the-kubernetes-limit-of-63-characters';
		const result = generateJobRunName(longName);
		expect(result.length).toBeLessThanOrEqual(63);
		expect(result).toMatch(/-20260212-143015$/);
	});

	it('removes trailing hyphens after truncation', () => {
		// Create a name that would end with hyphen after truncation
		const name = 'a'.repeat(40) + '-b';
		const result = generateJobRunName(name);
		expect(result.length).toBeLessThanOrEqual(63);
		expect(result).not.toMatch(/--20260212-143015$/);
	});

	it('falls back to "run" prefix for empty or invalid names', () => {
		expect(generateJobRunName('___')).toBe('run-20260212-143015');
		expect(generateJobRunName('---')).toBe('run-20260212-143015');
		expect(generateJobRunName('')).toBe('run-20260212-143015');
	});

	it('preserves timestamp even for very long names', () => {
		const veryLongName = 'a'.repeat(100);
		const result = generateJobRunName(veryLongName);
		expect(result).toContain('20260212-143015');
		expect(result.length).toBeLessThanOrEqual(63);
	});

	it('generates valid Kubernetes resource names', () => {
		const k8sNameRegex = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;
		const testCases = [
			'simple',
			'with-hyphens',
			'UPPERCASE',
			'with_underscores',
			'with.dots',
			'123numeric',
			'---leading',
			'trailing---',
			'a'.repeat(100)
		];

		testCases.forEach((testCase) => {
			const result = generateJobRunName(testCase);
			expect(result).toMatch(k8sNameRegex);
			expect(result.length).toBeLessThanOrEqual(63);
		});
	});
});
