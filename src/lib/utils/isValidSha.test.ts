import { isValidSha } from './isValidSha';

describe('isValidSha', () => {
	test('validates correct 40-character SHA-1 hashes', () => {
		expect(isValidSha('a94a8fe5ccb19ba61c4c0873d391e987982fbbd3')).toBe(true);
		expect(isValidSha('0123456789abcdef0123456789abcdef01234567')).toBe(true);
		expect(isValidSha('ffffffffffffffffffffffffffffffffffffffff')).toBe(true);
		expect(isValidSha('0000000000000000000000000000000000000000')).toBe(true);
	});

	test('rejects 7-character short SHAs', () => {
		expect(isValidSha('a94a8fe')).toBe(false);
		expect(isValidSha('0123456')).toBe(false);
		expect(isValidSha('fffffff')).toBe(false);
		expect(isValidSha('0000000')).toBe(false);
	});

	test('rejects invalid lengths', () => {
		expect(isValidSha('')).toBe(false);
		expect(isValidSha('a')).toBe(false);
		expect(isValidSha('a94a8f')).toBe(false); // 6 chars
		expect(isValidSha('a94a8fe5')).toBe(false); // 8 chars
		expect(isValidSha('a94a8fe5ccb19ba61c4c0873d391e987982fbbd')).toBe(false); // 39 chars
		expect(isValidSha('a94a8fe5ccb19ba61c4c0873d391e987982fbbd33')).toBe(false); // 41 chars
	});

	test('rejects non-hexadecimal characters', () => {
		expect(isValidSha('g94a8fe')).toBe(false); // g is not hex
		expect(isValidSha('a94a8fz5ccb19ba61c4c0873d391e987982fbbd3')).toBe(false); // z is not hex
		expect(isValidSha('a94a8f!')).toBe(false);
		expect(isValidSha('a94a8f ')).toBe(false); // space
		expect(isValidSha('A94A8FE')).toBe(false); // uppercase not allowed
	});

	test('handles edge cases', () => {
		expect(isValidSha(null as unknown as string)).toBe(false);
		expect(isValidSha(undefined as unknown as string)).toBe(false);
		expect(isValidSha(123 as unknown as string)).toBe(false);
		expect(isValidSha({} as unknown as string)).toBe(false);
	});
});
