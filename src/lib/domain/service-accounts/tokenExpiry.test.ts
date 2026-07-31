import { DEFAULT_EXPIRY, resolveExpiry } from './tokenExpiry';

const monthsFromNow = (months: number) => {
	const d = new Date();
	d.setMonth(d.getMonth() + months);
	return d;
};

describe('resolveExpiry', () => {
	test('returns no date when the token should never expire', () => {
		expect(resolveExpiry('never', null)).toEqual({});
	});

	test('resolves presets relative to now', () => {
		for (const [option, months] of [
			['3m', 3],
			['6m', 6],
			['1y', 12],
			['2y', 24]
		] as const) {
			const { date, error } = resolveExpiry(option, null);
			expect(error).toBeUndefined();
			expect(date?.getFullYear()).toBe(monthsFromNow(months).getFullYear());
			expect(date?.getMonth()).toBe(monthsFromNow(months).getMonth());
		}
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
		const { date, error } = resolveExpiry(null, null);
		expect(error).toBeUndefined();
		expect(DEFAULT_EXPIRY).toBe('1y');
		expect(date?.getFullYear()).toBe(monthsFromNow(12).getFullYear());
		expect(date?.getMonth()).toBe(monthsFromNow(12).getMonth());
	});
});
