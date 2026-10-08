import { canDeleteBranch, formString, postgresConfiguration, resourceInput } from './forms';

describe('Postgres forms', () => {
	test('omits blank resources and keeps explicit false for high availability', () => {
		const data = new FormData();
		data.set('cpu', ' ');
		data.set('memory', '');
		expect(resourceInput(postgresConfiguration(data))).toEqual({
			cpu: undefined,
			memory: undefined,
			diskSize: undefined,
			highAvailability: false
		});
	});

	test('passes Kubernetes quantities without converting or losing precision', () => {
		const data = new FormData();
		data.set('cpu', ' 100m ');
		data.set('memory', '512Mi');
		data.set('diskSize', '10Gi');
		data.set('highAvailability', 'on');
		expect(resourceInput(postgresConfiguration(data))).toEqual({
			cpu: '100m',
			memory: '512Mi',
			diskSize: '10Gi',
			highAvailability: true
		});
	});

	test('does not treat a file as a text field', () => {
		const data = new FormData();
		data.set('name', new Blob(['database']), 'name.txt');
		expect(formString(data, 'name')).toBe('');
	});

	test.each([
		['main', 'main', 'restore', false],
		['restore', 'main', 'restore', false],
		['old', 'main', 'restore', true],
		['main', null, null, false],
		['restore', null, null, true]
	])(
		'checks deletion of %s with active %s and requested %s',
		(branch, active, requested, expected) => {
			expect(canDeleteBranch(branch, active, requested)).toBe(expected);
		}
	);
});
