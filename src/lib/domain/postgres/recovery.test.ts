import {
	parseRecoveryTime,
	recoveryTimeMinimum,
	recoveryTimeError,
	restorePostgresHref,
	recoveryPending
} from './recovery.js';

describe('point-in-time recovery', () => {
	test.each([
		'2026-02-30T12:00',
		'2026-01-01T24:00',
		'2026-01-01T12:00Z',
		'',
		'2026-01-01T12:00:00'
	])('rejects invalid UTC minute %s', (value) => {
		expect(parseRecoveryTime(value)).toBeNull();
	});
	test('uses UTC and rounds the earliest selectable minute up', () => {
		expect(parseRecoveryTime('2026-11-01T01:30')?.toISOString()).toBe('2026-11-01T01:30:00.000Z');
		expect(recoveryTimeMinimum(new Date('2026-01-01T12:00:01Z'))).toBe('2026-01-01T12:01');
		expect(recoveryTimeMinimum(new Date('2026-01-01T12:00:00Z'))).toBe('2026-01-01T12:00');
	});
	test('requires a loaded recovery window and bounds the target', () => {
		const earliest = new Date('2026-01-01T12:00:01Z');
		const now = new Date('2026-01-01T13:00:00Z');
		expect(recoveryTimeError('2026-01-01T12:01', null, now)).toBeTruthy();
		expect(recoveryTimeError('2026-01-01T12:00', earliest, now)).toBeTruthy();
		expect(recoveryTimeError('2026-01-01T13:01', earliest, now)).toBeTruthy();
		expect(recoveryTimeError('2026-01-01T12:01', earliest, now)).toBeUndefined();
	});
	test('existing database entry point presets the shared create flow', () => {
		const url = new URL(
			restorePostgresHref('my-team', 'dev-gcp', 'source-db'),
			'https://console.test'
		);
		expect(url.pathname).toBe('/team/my-team/postgres/create');
		expect(Object.fromEntries(url.searchParams)).toEqual({
			environment: 'dev-gcp',
			source: 'source-db',
			mode: 'recovery'
		});
	});
	test('polls pending recovery independently of database availability', () => {
		expect(recoveryPending({ completed: false })).toBe(true);
		expect(recoveryPending({ completed: true })).toBe(false);
		expect(recoveryPending({ completed: false, failureMessage: 'WAL missing' })).toBe(false);
		expect(recoveryPending(null)).toBe(false);
	});
});
