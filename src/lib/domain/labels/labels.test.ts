import {
	duplicateLabelKeys,
	formatLabelFilter,
	labelFilterId,
	labelKeyError,
	labelRowsHaveErrors,
	labelValueError,
	parseLabelsParam,
	rowKeyError,
	rowValueError,
	rowsFromArrays,
	toLabelInput,
	toLabelRows
} from './labels';

describe('labelKeyError', () => {
	test.each([
		{ key: '', expected: 'Key is required' },
		{ key: '   ', expected: 'Key is required' },
		{ key: 'a'.repeat(64), expected: 'Must be at most 63 characters' },
		{
			key: 'has space',
			expected: 'Must consist of letters, numbers, hyphens, underscores, slashes or dots'
		},
		{
			key: 'has/slash',
			expected: ''
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
			'Must consist of letters, numbers, hyphens, underscores, slashes or dots'
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
	test('drops empty rows and trims', () => {
		expect(
			toLabelInput([
				{ key: '  team  ', value: '  platform  ' },
				{ key: '', value: 'ignored' },
				{ key: 'env', value: '' }
			])
		).toEqual([
			{ key: `team`, value: 'platform' },
			{ key: `env`, value: '' }
		]);
	});

	test('returns an empty list when every row is empty', () => {
		expect(toLabelInput([{ key: '', value: '' }])).toEqual([]);
	});
});

describe('toLabelRows', () => {
	test('maps existing labels to editor rows', () => {
		expect(
			toLabelRows([
				{ key: `team`, value: 'platform' },
				{ key: `env`, value: 'prod' }
			])
		).toEqual([
			{ key: 'team', value: 'platform' },
			{ key: 'env', value: 'prod' }
		]);
	});
});

describe('parseLabelsParam', () => {
	test('returns undefined without filters', () => {
		expect(parseLabelsParam(null)).toBeUndefined();
		expect(parseLabelsParam(',')).toBeUndefined();
	});

	test('reads key-only filters without silently dropping invalid keys', () => {
		expect(parseLabelsParam('owner:a,region,bad key:x')).toEqual([
			{ key: 'owner', value: 'a' },
			{ key: 'region', value: undefined },
			{ key: 'bad key', value: 'x' }
		]);
	});

	test('deduplicates repeated filters', () => {
		expect(parseLabelsParam('region,region,owner:a,owner:a')).toEqual([
			{ key: 'region', value: undefined },
			{ key: 'owner', value: 'a' }
		]);
	});

	test('accepts qualified keys longer than 63 characters', () => {
		const key = `${'a'.repeat(63)}.example.com/owner`;
		expect(parseLabelsParam(`${key}:team`)).toEqual([{ key, value: 'team' }]);
	});

	test('preserves reserved keys and invalid values for backend validation', () => {
		expect(
			parseLabelsParam('team:example,app.kubernetes.io/managed-by:console,owner: value ')
		).toEqual([
			{ key: 'team', value: 'example' },
			{ key: 'app.kubernetes.io/managed-by', value: 'console' },
			{ key: 'owner', value: ' value ' }
		]);
	});

	test('keeps key-only and empty-value filters distinct', () => {
		expect(parseLabelsParam('region,region:')).toEqual([
			{ key: 'region', value: undefined },
			{ key: 'region', value: '' }
		]);
	});
});

describe('labelFilterId', () => {
	test('round-trips through parseLabelsParam', () => {
		const filters = [{ key: 'region' }, { key: 'region', value: '' }, { key: 'owner', value: 'a' }];
		expect(parseLabelsParam(filters.map(labelFilterId).join(','))).toEqual(
			filters.map(({ key, value }) => ({ key, value }))
		);
	});
});

describe('formatLabelFilter', () => {
	test('shows key-only filters without a value', () => {
		expect(formatLabelFilter({ key: 'region' })).toBe('region');
		expect(formatLabelFilter({ key: 'region', value: '' })).toBe('region=');
		expect(formatLabelFilter({ key: 'owner', value: 'a' })).toBe('owner=a');
	});
});
