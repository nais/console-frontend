import {
	CLONE_LATEST_POINT_BUFFER_MINUTES,
	clonePostgresHref,
	defaultCloneTime,
	formatLocalInput,
	formatLocalTime,
	parseCloneMode,
	parseInstant,
	parseLocalDateTime,
	recoveryPending,
	recoveryTimeError,
	recoveryTimeMinimum,
	resolveCloneTarget
} from './recovery.js';

const oslo = 'Europe/Oslo';
const iso = (result: ReturnType<typeof parseLocalDateTime>) =>
	'instant' in result ? result.instant.toISOString() : result.error;

describe('local time parsing', () => {
	test.each([
		'2026-02-30T12:00',
		'2026-01-01T24:00',
		'2026-01-01T12:00Z',
		'',
		'2026-01-01T12:00:00'
	])('rejects invalid value %s', (value) => {
		expect(iso(parseLocalDateTime(value, oslo))).toBe('invalid');
	});
	test('interprets the value in the given zone, not UTC', () => {
		expect(iso(parseLocalDateTime('2026-01-15T12:00', oslo))).toBe('2026-01-15T11:00:00.000Z');
		expect(iso(parseLocalDateTime('2026-07-15T12:00', oslo))).toBe('2026-07-15T10:00:00.000Z');
		expect(iso(parseLocalDateTime('2026-07-15T12:00', 'UTC'))).toBe('2026-07-15T12:00:00.000Z');
		expect(iso(parseLocalDateTime('2026-07-15T12:00', 'America/New_York'))).toBe(
			'2026-07-15T16:00:00.000Z'
		);
	});
	test('rejects nonexistent local times in the spring-forward gap', () => {
		// 2026-03-29 02:00-03:00 does not exist in Europe/Oslo.
		expect(iso(parseLocalDateTime('2026-03-29T02:30', oslo))).toBe('nonexistent');
		expect(iso(parseLocalDateTime('2026-03-29T01:59', oslo))).toBe('2026-03-29T00:59:00.000Z');
		expect(iso(parseLocalDateTime('2026-03-29T03:00', oslo))).toBe('2026-03-29T01:00:00.000Z');
	});
	test('resolves ambiguous local times to the first occurrence', () => {
		// 2026-10-25 02:00-03:00 happens twice in Europe/Oslo (CEST then CET).
		expect(iso(parseLocalDateTime('2026-10-25T02:30', oslo))).toBe('2026-10-25T00:30:00.000Z');
		expect(iso(parseLocalDateTime('2026-10-25T03:00', oslo))).toBe('2026-10-25T02:00:00.000Z');
	});
	test('formats instants as local input values and labelled display times', () => {
		const instant = new Date('2026-07-15T10:00:01Z');
		expect(formatLocalInput(instant, oslo)).toBe('2026-07-15T12:00');
		expect(formatLocalTime(instant, oslo)).toMatch(/15 Jul 2026.*12:00:01 (CEST|GMT\+2)/);
		expect(formatLocalTime(instant, 'UTC')).toContain('10:00:01');
		expect(formatLocalTime(instant, 'UTC')).toContain('UTC');
	});
	test('rounds the earliest selectable minute up, in local time', () => {
		expect(recoveryTimeMinimum(new Date('2026-01-01T12:00:01Z'), oslo)).toBe('2026-01-01T13:01');
		expect(recoveryTimeMinimum(new Date('2026-01-01T12:00:00Z'), oslo)).toBe('2026-01-01T13:00');
		expect(recoveryTimeMinimum(null, oslo)).toBeUndefined();
	});
	test('parses only whole-second ISO instants sent by the browser', () => {
		expect(parseInstant('2026-01-01T12:00:05.000Z')?.toISOString()).toBe(
			'2026-01-01T12:00:05.000Z'
		);
		expect(parseInstant('2026-01-01T12:00:05Z')).not.toBeNull();
		for (const bad of [
			'',
			'2026-01-01T12:00',
			'2026-02-30T12:00:00.000Z',
			'2026-01-01T12:00:05.500Z'
		])
			expect(parseInstant(bad)).toBeNull();
	});
});

describe('clone target resolution', () => {
	const earliest = new Date('2026-01-01T12:00:01Z');
	const now = new Date('2026-01-01T13:00:30.750Z');
	test('defaults to now minus the buffer, truncated to whole seconds', () => {
		expect(CLONE_LATEST_POINT_BUFFER_MINUTES).toBe(10);
		expect(defaultCloneTime(now).toISOString()).toBe('2026-01-01T12:50:30.000Z');
		expect(resolveCloneTarget(null, earliest, now)).toEqual({
			target: new Date('2026-01-01T12:50:30.000Z')
		});
	});
	test('rejects a default before the earliest clone time with a clear error', () => {
		const result = resolveCloneTarget(null, earliest, new Date('2026-01-01T12:05:00Z'), oslo);
		expect(result).toMatchObject({ error: expect.stringContaining('earliest clone time') });
		expect('error' in result && result.error).toContain('about 10 minutes ago');
		expect('error' in result && result.error).toMatch(/13:00:01/);
	});
	test('compares explicit absolute instants against the window', () => {
		expect(resolveCloneTarget(new Date('2026-01-01T12:00:00Z'), earliest, now)).toHaveProperty(
			'error'
		);
		expect(resolveCloneTarget(new Date('2026-01-01T13:01:00Z'), earliest, now)).toHaveProperty(
			'error'
		);
		expect(resolveCloneTarget(new Date('2026-01-01T12:30:00.900Z'), earliest, now)).toEqual({
			target: new Date('2026-01-01T12:30:00.000Z')
		});
		expect(resolveCloneTarget(null, null, now)).toHaveProperty('error');
	});
	test('validates the local field in the user zone; empty is allowed', () => {
		// 13:30 in Oslo is 12:30Z; 13:00 in Oslo is 12:00Z which is before the earliest time.
		expect(recoveryTimeError('2026-01-01T13:30', earliest, now, oslo)).toBeUndefined();
		expect(recoveryTimeError('2026-01-01T13:00', earliest, now, oslo)).toContain('earliest');
		// The same text read as UTC would be in the future relative to 13:00Z.
		expect(recoveryTimeError('2026-01-01T13:30', earliest, now, 'UTC')).toContain('future');
		expect(recoveryTimeError('', earliest, now, oslo)).toBeUndefined();
		expect(recoveryTimeError('2026-03-29T02:30', earliest, now, oslo)).toContain('does not exist');
		expect(recoveryTimeError('garbage', earliest, now, oslo)).toContain('valid');
	});
});

describe('clone entry points', () => {
	test('existing database entry point presets the shared create flow', () => {
		const url = new URL(
			clonePostgresHref('my-team', 'dev-gcp', 'source-db'),
			'https://console.test'
		);
		expect(url.pathname).toBe('/team/my-team/postgres/create');
		expect(Object.fromEntries(url.searchParams)).toEqual({
			environment: 'dev-gcp',
			source: 'source-db',
			mode: 'clone'
		});
	});
	test('keeps the legacy recovery mode value working', () => {
		expect(parseCloneMode('clone')).toBe('clone');
		expect(parseCloneMode('recovery')).toBe('clone');
		expect(parseCloneMode('empty')).toBe('empty');
		expect(parseCloneMode(null)).toBe('empty');
	});
	test('polls pending recovery independently of database availability', () => {
		expect(recoveryPending({ completed: false })).toBe(true);
		expect(recoveryPending({ completed: true })).toBe(false);
		expect(recoveryPending({ completed: false, failureMessage: 'WAL missing' })).toBe(false);
		expect(recoveryPending(null)).toBe(false);
	});
});
