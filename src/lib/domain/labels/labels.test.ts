import {
	LABEL_PREFIX,
	duplicateLabelKeys,
	labelKeyError,
	labelRowsHaveErrors,
	labelValueError,
	rowKeyError,
	rowValueError,
	rowsFromArrays,
	stripLabelPrefix,
	toLabelInput,
	toLabelRows,
	withLabelPrefix
} from './labels';

describe('stripLabelPrefix', () => {
	test('removes the prefix when present', () => {
		expect(stripLabelPrefix(`${LABEL_PREFIX}team`)).toBe('team');
	});

	test('leaves keys without the prefix untouched', () => {
		expect(stripLabelPrefix('team')).toBe('team');
	});
});

describe('withLabelPrefix', () => {
	test('adds the prefix to a bare suffix', () => {
		expect(withLabelPrefix('team')).toBe(`${LABEL_PREFIX}team`);
	});

	test('does not double-prefix an already prefixed key', () => {
		expect(withLabelPrefix(`${LABEL_PREFIX}team`)).toBe(`${LABEL_PREFIX}team`);
	});

	test('trims surrounding whitespace', () => {
		expect(withLabelPrefix('  team  ')).toBe(`${LABEL_PREFIX}team`);
	});
});

describe('labelKeyError', () => {
	test.each([
		{ key: '', expected: 'Key is required' },
		{ key: '   ', expected: 'Key is required' },
		{ key: 'a'.repeat(64), expected: 'Must be at most 63 characters' },
		{
			key: 'has space',
			expected: 'Must consist of letters, numbers, hyphens, underscores, or dots'
		},
		{
			key: 'has/slash',
			expected: 'Must consist of letters, numbers, hyphens, underscores, or dots'
		},
		{ key: 'valid', expected: '' },
		{ key: 'valid.key_1-2', expected: '' },
		{ key: 'a'.repeat(63), expected: '' }
	])('returns "$expected" for "$key"', ({ key, expected }) => {
		expect(labelKeyError(key)).toBe(expected);
	});
});

describe('labelValueError', () => {
	test.each([
		{ value: '', expected: '' },
		{ value: '   ', expected: '' },
		{ value: 'a'.repeat(64), expected: 'Must be at most 63 characters' },
		{
			value: 'has space',
			expected: 'Must consist of letters, numbers, hyphens, underscores, or dots'
		},
		{ value: 'valid-value.1', expected: '' }
	])('returns "$expected" for "$value"', ({ value, expected }) => {
		expect(labelValueError(value)).toBe(expected);
	});
});

describe('duplicateLabelKeys', () => {
	test('detects repeated keys and ignores empty ones', () => {
		const dupes = duplicateLabelKeys([
			{ key: 'team', value: 'a' },
			{ key: 'team', value: 'b' },
			{ key: '', value: 'c' },
			{ key: 'env', value: 'd' }
		]);
		expect([...dupes]).toEqual(['team']);
	});

	test('trims keys before comparing', () => {
		const dupes = duplicateLabelKeys([
			{ key: 'team', value: 'a' },
			{ key: '  team  ', value: 'b' }
		]);
		expect([...dupes]).toEqual(['team']);
	});
});

describe('rowKeyError', () => {
	test('returns no error for a fully empty row', () => {
		expect(rowKeyError({ key: '', value: '' }, new Set())).toBe('');
	});

	test('requires a key when only the value is filled', () => {
		expect(rowKeyError({ key: '', value: 'v' }, new Set())).toBe('Key is required');
	});

	test('flags duplicate keys', () => {
		expect(rowKeyError({ key: 'team', value: 'v' }, new Set(['team']))).toBe('Duplicate key');
	});

	test('validates the key charset', () => {
		expect(rowKeyError({ key: 'bad key', value: 'v' }, new Set())).toBe(
			'Must consist of letters, numbers, hyphens, underscores, or dots'
		);
	});
});

describe('rowValueError', () => {
	test('returns no error for a fully empty row', () => {
		expect(rowValueError({ key: '', value: '' })).toBe('');
	});

	test('validates the value of a filled row', () => {
		expect(rowValueError({ key: 'team', value: 'bad value' })).toBe(
			'Must consist of letters, numbers, hyphens, underscores, or dots'
		);
	});
});

describe('labelRowsHaveErrors', () => {
	test('is false for valid rows', () => {
		expect(
			labelRowsHaveErrors([
				{ key: 'team', value: 'platform' },
				{ key: 'env', value: '' }
			])
		).toBe(false);
	});

	test('is false for an all-empty editor', () => {
		expect(labelRowsHaveErrors([{ key: '', value: '' }])).toBe(false);
	});

	test('is true when a duplicate key exists', () => {
		expect(
			labelRowsHaveErrors([
				{ key: 'team', value: 'a' },
				{ key: 'team', value: 'b' }
			])
		).toBe(true);
	});

	test('is true when a value is invalid', () => {
		expect(labelRowsHaveErrors([{ key: 'team', value: 'bad value' }])).toBe(true);
	});
});

describe('rowsFromArrays', () => {
	test('zips parallel arrays, defaulting missing values to empty', () => {
		expect(rowsFromArrays(['team', 'env'], ['platform'])).toEqual([
			{ key: 'team', value: 'platform' },
			{ key: 'env', value: '' }
		]);
	});
});

describe('toLabelInput', () => {
	test('drops empty rows, trims, and reattaches the prefix', () => {
		expect(
			toLabelInput([
				{ key: '  team  ', value: '  platform  ' },
				{ key: '', value: 'ignored' },
				{ key: 'env', value: '' }
			])
		).toEqual([
			{ key: `${LABEL_PREFIX}team`, value: 'platform' },
			{ key: `${LABEL_PREFIX}env`, value: '' }
		]);
	});

	test('returns an empty list when every row is empty', () => {
		expect(toLabelInput([{ key: '', value: '' }])).toEqual([]);
	});
});

describe('toLabelRows', () => {
	test('strips the prefix from existing labels', () => {
		expect(
			toLabelRows([
				{ key: `${LABEL_PREFIX}team`, value: 'platform' },
				{ key: `${LABEL_PREFIX}env`, value: 'prod' }
			])
		).toEqual([
			{ key: 'team', value: 'platform' },
			{ key: 'env', value: 'prod' }
		]);
	});
});
