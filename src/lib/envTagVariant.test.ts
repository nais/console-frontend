import { envTagVariant } from './envTagVariant';

describe('envTagVariant', () => {
	test.each([
		['dev', 'neutral-filled'],
		['test', 'neutral-filled'],
		['ci', 'neutral-filled'],
		['sandbox', 'neutral-filled'],
		['non-prod', 'neutral-filled'],
		['dev-gcp', 'neutral-filled']
	])('returns neutral-filled for %s', (env, expected) => {
		expect(envTagVariant(env)).toBe(expected);
	});

	test.each([
		['prod', 'info-moderate'],
		['prod-gcp', 'info-moderate']
	])('returns info-moderate for %s', (env, expected) => {
		expect(envTagVariant(env)).toBe(expected);
	});

	test('returns alt3-moderate for prod-fss', () => {
		expect(envTagVariant('prod-fss')).toBe('alt3-moderate');
	});

	test('returns neutral-moderate for dev-fss', () => {
		expect(envTagVariant('dev-fss')).toBe('neutral-moderate');
	});

	test('falls back to info-moderate for unknown envs containing prod', () => {
		expect(envTagVariant('prod-external')).toBe('info-moderate');
		expect(envTagVariant('my-prod-env')).toBe('info-moderate');
	});

	test('falls back to neutral-filled for unknown envs', () => {
		expect(envTagVariant('staging')).toBe('neutral-filled');
		expect(envTagVariant('custom-env')).toBe('neutral-filled');
	});
});
