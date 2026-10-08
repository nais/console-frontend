import {
	canDeleteBranch,
	configurationError,
	configurationErrors,
	formString,
	postgresConfiguration,
	quantityInUnits,
	resourceInput
} from './forms';

describe('Postgres forms', () => {
	test('returns all resource errors keyed by field', () => {
		expect(configurationErrors({ cpu: '9', memory: '0', diskSize: '1001' })).toEqual({
			cpu: 'CPU (cores) must be no greater than 8.',
			memory: 'Memory (GiB) must be a positive decimal number.',
			diskSize: 'Storage (GiB) must be a whole number between 10 and 1000.'
		});
		expect(configurationErrors({ cpu: '0,1', memory: '0.5', diskSize: '10' })).toEqual({});
	});
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

	test('converts decimal units and comma separators without losing precision', () => {
		const data = new FormData();
		data.set('cpu', ' 0,1 ');
		data.set('memory', '0,5');
		data.set('diskSize', '10');
		data.set('highAvailability', 'on');
		expect(resourceInput(postgresConfiguration(data))).toEqual({
			cpu: '0.1',
			memory: '0.5Gi',
			diskSize: '10Gi',
			highAvailability: true
		});
	});

	test.each([
		['100m', 'cores', '0.1'],
		['1', 'cores', '1'],
		['1e-3', 'cores', '0.001'],
		['512Mi', 'GiB', '0.5'],
		['10Gi', 'GiB', '10'],
		['1Ki', 'GiB', '0.00000095367431640625'],
		['1G', 'GiB', '0.931322574615478515625'],
		['1234567890123456789', 'GiB', '1149780945.967376966960728168487548828125'],
		[null, 'cores', '']
	] as const)('converts %s to %s exactly', (quantity, unit, expected) => {
		expect(quantityInUnits(quantity, unit)).toBe(expected);
	});

	test('surfaces invalid stored quantities', () => {
		expect(() => quantityInUnits('invalid', 'GiB')).toThrow('Invalid Postgres resource quantity');
	});

	test.each(['0', '-1', '100m', '1e3', 'NaN', 'Infinity', '0,1.2'])(
		'rejects invalid decimal resource %s',
		(value) => {
			for (const name of ['cpu', 'memory']) {
				expect(
					configurationError({
						cpu: '',
						memory: '',
						diskSize: '',
						highAvailability: false,
						[name]: value
					})
				).toBeDefined();
			}
		}
	);

	test.each(['9', '0', '-10', '10.5', '10Gi', '10,5'])('rejects invalid storage %s', (diskSize) => {
		expect(
			configurationError({ cpu: '', memory: '', diskSize, highAvailability: false })
		).toBeDefined();
	});

	test.each(['0.1', '0,5', '8', '0.0001'])('accepts positive decimal %s', (value) => {
		expect(
			configurationError({ cpu: value, memory: value, diskSize: '10', highAvailability: false })
		).toBeUndefined();
	});

	test.each([
		['cpu', '8', true],
		['cpu', '8,000', true],
		['cpu', '8.0000000000000000001', false],
		['cpu', '100', false],
		['memory', '32', true],
		['memory', '32,0000000000000000001', false],
		['memory', '33', false],
		['diskSize', '10', true],
		['diskSize', '1000', true],
		['diskSize', '1001', false]
	])('enforces inclusive limits for %s=%s', (name, value, valid) => {
		const error = configurationError({
			cpu: '',
			memory: '',
			diskSize: '',
			highAvailability: false,
			[name]: value
		});
		expect(error === undefined).toBe(valid);
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
