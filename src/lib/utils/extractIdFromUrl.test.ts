import { extractIdFromUrl } from './extractIdFromUrl';

describe('extractIdFromUrl', () => {
	test('extracts ID from GitHub image URLs', () => {
		expect(extractIdFromUrl('https://avatars.githubusercontent.com/u/12345?v=4')).toBe('12345?v=4');
		expect(extractIdFromUrl('https://avatars.githubusercontent.com/u/67890?s=200')).toBe(
			'67890?s=200'
		);
	});

	test('extracts ID from gravatar URLs', () => {
		expect(extractIdFromUrl('https://www.gravatar.com/avatar/abc123def456?d=identicon')).toBe(
			'abc123def456?d=identicon'
		);
		expect(extractIdFromUrl('https://gravatar.com/avatar/xyz789?s=80')).toBe('xyz789?s=80');
	});

	test('handles URLs without query parameters', () => {
		expect(extractIdFromUrl('https://avatars.githubusercontent.com/u/12345')).toBe('12345');
		expect(extractIdFromUrl('https://www.gravatar.com/avatar/abc123')).toBe('abc123');
	});

	test('handles URLs with trailing slashes', () => {
		expect(extractIdFromUrl('https://avatars.githubusercontent.com/u/12345/')).toBe('');
		expect(extractIdFromUrl('https://www.gravatar.com/avatar/abc123/')).toBe('');
	});

	test('returns empty string for invalid URLs', () => {
		expect(extractIdFromUrl('')).toBe('');
		expect(extractIdFromUrl('not-a-url')).toBe('not-a-url');
		expect(extractIdFromUrl('https://example.com')).toBe('example.com');
	});

	test('handles different URL formats', () => {
		expect(extractIdFromUrl('https://avatars.githubusercontent.com/u/12345?v=4&size=large')).toBe(
			'12345?v=4&size=large'
		);
		expect(extractIdFromUrl('http://avatars.githubusercontent.com/u/99999')).toBe('99999');
	});

	test('extracts only the ID segment', () => {
		expect(extractIdFromUrl('https://avatars.githubusercontent.com/u/12345/extra')).toBe('extra');
	});
});
