import { DEFAULT_EXPIRY, resolveExpiry } from './tokenExpiry';

// Presets are relative to the current clock, so freeze it and assert concrete calendar days.
// Comparing local days rather than instants keeps this independent of DST and time zone.
const day = (date: Date | undefined) => date?.toDateString();

describe('resolveExpiry', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('returns no date when the token should never expire', () => {
		expect(resolveExpiry('never', null)).toEqual({});
	});

	test('resolves presets relative to now', () => {
		vi.setSystemTime(new Date(2026, 2, 15, 12));

		expect(day(resolveExpiry('30d', null).date)).toBe(day(new Date(2026, 3, 14)));
		expect(day(resolveExpiry('90d', null).date)).toBe(day(new Date(2026, 5, 13)));
		expect(day(resolveExpiry('180d', null).date)).toBe(day(new Date(2026, 8, 11)));
		expect(day(resolveExpiry('365d', null).date)).toBe(day(new Date(2027, 2, 15)));
	});

	// The count is in calendar days, so a span crossing a DST change is still exactly 30 days
	// even though it is not exactly 720 hours.
	test('counts calendar days across a daylight saving change', () => {
		vi.setSystemTime(new Date(2026, 9, 20, 12));
		expect(day(resolveExpiry('30d', null).date)).toBe(day(new Date(2026, 10, 19)));
	});

	test('counts calendar days across a leap day', () => {
		vi.setSystemTime(new Date(2024, 1, 29, 12));
		expect(day(resolveExpiry('365d', null).date)).toBe(day(new Date(2025, 1, 28)));
	});

	test('uses the submitted date for a custom expiry', () => {
		const { date, error } = resolveExpiry('custom', '2030-01-15');
		expect(error).toBeUndefined();
		expect(date).toEqual(new Date('2030-01-15'));
	});

	test('rejects a custom expiry with a missing or invalid date', () => {
		expect(resolveExpiry('custom', null).error).toBe('Choose an expiry date');
		expect(resolveExpiry('custom', 'not-a-date').error).toBe('Expires at must be a valid date');
	});

	test('rejects an unknown option', () => {
		expect(resolveExpiry('5w', null).error).toBe('Invalid expiry option');
	});

	// Forms cached from before expiresIn existed only submit expiresAt.
	test('treats a missing option with a date as a custom expiry', () => {
		expect(resolveExpiry(null, '2030-01-15').date).toEqual(new Date('2030-01-15'));
		expect(resolveExpiry('', '2030-01-15').date).toEqual(new Date('2030-01-15'));
	});

	test('falls back to the default when neither option nor date is submitted', () => {
		vi.setSystemTime(new Date(2026, 2, 15, 12));

		const { date, error } = resolveExpiry(null, null);
		expect(error).toBeUndefined();
		expect(DEFAULT_EXPIRY).toBe('365d');
		expect(day(date)).toBe(day(new Date(2027, 2, 15)));
	});
});
