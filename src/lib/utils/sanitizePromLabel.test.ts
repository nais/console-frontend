import { sanitizePromLabel } from './formatters';

describe('sanitizePromLabel', () => {
	test('passes through valid labels', () => {
		expect(sanitizePromLabel('my_app.v1-2')).toBe('my_app.v1-2');
	});

	test('strips special characters', () => {
		expect(sanitizePromLabel('my app/v1:latest')).toBe('myappv1latest');
	});

	test('strips PromQL-unsafe characters', () => {
		expect(sanitizePromLabel('label{value="test\'s\\n"}')).toBe('labelvaluetestsn');
	});

	test('strips unicode and emoji', () => {
		expect(sanitizePromLabel('café☕')).toBe('caf');
	});

	test('returns empty string for all-invalid input', () => {
		expect(sanitizePromLabel('!@#$%^&*()')).toBe('');
	});

	test('handles empty string', () => {
		expect(sanitizePromLabel('')).toBe('');
	});
});
