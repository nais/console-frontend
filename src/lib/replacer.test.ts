import { replacer } from './replacer';

describe('replacer', () => {
	test('replaces single param', () => {
		expect(replacer('/team/[team]', { team: 'my-team' })).toBe('/team/my-team');
	});

	test('replaces multiple params', () => {
		expect(replacer('/team/[team]/[env]/app/[app]', { team: 't', env: 'dev', app: 'myapp' })).toBe(
			'/team/t/dev/app/myapp'
		);
	});

	test('strips route groups', () => {
		expect(replacer('/team/[team]/(settings)/members', { team: 'my-team' })).toBe(
			'/team/my-team/members'
		);
	});

	test('strips groups and replaces params', () => {
		expect(
			replacer('/team/[team]/[env]/(single)/kafka/[kafka]', {
				team: 't',
				env: 'dev',
				kafka: 'my-topic'
			})
		).toBe('/team/t/dev/kafka/my-topic');
	});

	test('handles route with no params or groups', () => {
		expect(replacer('/cost', {})).toBe('/cost');
	});
});
