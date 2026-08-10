import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
	activeFields,
	buildSections,
	CHECKBOX_ON,
	collectFormData,
	flattenFields,
	getValue,
	issueKey,
	normalizeValues,
	repeatDefaults,
	repeatRowCount,
	resolveField,
	rowFieldName,
	zodSchema,
	type Fields,
	type GroupConfig
} from './form';

const fields = [
	{
		type: 'text',
		name: 'name',
		label: 'Name',
		createOnly: true,
		validation: z.string().min(3)
	},
	{
		type: 'number',
		name: 'databases',
		label: 'Databases',
		validation: z.coerce.number().int().min(1).max(128).optional()
	},
	{
		type: 'checkbox',
		name: 'enabled',
		label: 'Enabled',
		validation: z.boolean()
	},
	{
		type: 'select',
		name: 'tier',
		label: 'Tier',
		group: 'advanced',
		options: [{ value: 'single' }, { value: 'ha' }],
		validation: z.enum(['single', 'ha'])
	},
	{
		type: 'text',
		name: 'notes',
		label: 'Notes',
		validation: z.string().optional()
	}
] as const satisfies Fields;

const groups: GroupConfig[] = [{ name: 'advanced', label: 'Advanced options' }];

describe('activeFields', () => {
	it('keeps every field in create mode', () => {
		expect(activeFields(fields, 'create').map((f) => f.name)).toEqual([
			'name',
			'databases',
			'enabled',
			'tier',
			'notes'
		]);
	});

	it('drops createOnly fields in edit mode', () => {
		expect(activeFields(fields, 'edit').map((f) => f.name)).not.toContain('name');
	});

	it('drops editOnly fields in create mode', () => {
		const withEditOnly = [
			{ type: 'text', name: 'a', label: 'A', validation: z.string() },
			{ type: 'text', name: 'b', label: 'B', editOnly: true, validation: z.string() }
		] as const satisfies Fields;

		expect(activeFields(withEditOnly, 'create').map((f) => f.name)).toEqual(['a']);
		expect(activeFields(withEditOnly, 'edit').map((f) => f.name)).toEqual(['a', 'b']);
	});

	it('drops fields a dynamic condition hides, but only when given values', () => {
		const conditional = [
			{ type: 'checkbox', name: 'custom', label: 'Custom', validation: z.boolean() },
			{
				type: 'text',
				name: 'value',
				label: 'Value',
				dynamic: (values: Record<string, string>) => ({ hidden: values.custom !== CHECKBOX_ON }),
				validation: z.string()
			}
		] as const satisfies Fields;

		expect(activeFields(conditional, 'create').map((f) => f.name)).toEqual(['custom', 'value']);
		expect(activeFields(conditional, 'create', { custom: '' }).map((f) => f.name)).toEqual([
			'custom'
		]);
		expect(activeFields(conditional, 'create', { custom: CHECKBOX_ON }).map((f) => f.name)).toEqual(
			['custom', 'value']
		);
	});
});

describe('zodSchema', () => {
	const schema = zodSchema(fields);

	it('treats an empty number input as absent instead of zero', () => {
		const result = schema.safeParse({
			name: 'valkey',
			databases: '',
			enabled: '',
			tier: 'single',
			notes: ''
		});

		expect(result.success).toBe(true);
		expect(result.data?.databases).toBeUndefined();
	});

	it('coerces number input', () => {
		const result = schema.safeParse({
			name: 'valkey',
			databases: '32',
			enabled: '',
			tier: 'single',
			notes: ''
		});

		expect(result.data?.databases).toBe(32);
	});

	it('still enforces number constraints', () => {
		const result = schema.safeParse({
			name: 'valkey',
			databases: '999',
			enabled: '',
			tier: 'single',
			notes: ''
		});

		expect(result.success).toBe(false);
	});

	it('turns checkbox input into a boolean', () => {
		const base = { name: 'valkey', databases: '16', tier: 'single', notes: '' };

		expect(schema.safeParse({ ...base, enabled: CHECKBOX_ON }).data?.enabled).toBe(true);
		expect(schema.safeParse({ ...base, enabled: '' }).data?.enabled).toBe(false);
	});

	it('keeps empty strings for optional text so a value can be cleared', () => {
		const result = schema.safeParse({
			name: 'valkey',
			databases: '16',
			enabled: '',
			tier: 'single',
			notes: ''
		});

		expect(result.data?.notes).toBe('');
	});
});

describe('zodSchema constraints', () => {
	const limited = [
		{
			type: 'number',
			name: 'storageGB',
			label: 'Storage',
			inputProps: { min: 350, max: 1750 },
			validation: z.coerce.number()
		}
	] as const satisfies Fields;

	it('enforces the limits the field renders under', () => {
		const schema = zodSchema(limited);

		expect(schema.safeParse({ storageGB: '16' }).success).toBe(false);
		expect(schema.safeParse({ storageGB: '9999' }).success).toBe(false);
		expect(schema.safeParse({ storageGB: '400' }).success).toBe(true);
	});

	it('reports the limit it violated using the field label', () => {
		const result = zodSchema(limited).safeParse({ storageGB: '16' });

		expect(result.error?.issues[0].message).toBe('Storage must be between 350 and 1750');
	});

	it('enforces limits that only exist once other values are known', () => {
		const dynamic = [
			{ type: 'text', name: 'tier', label: 'Tier', validation: z.string() },
			{
				type: 'number',
				name: 'storageGB',
				label: 'Storage',
				dynamic: (values: Record<string, string>) =>
					values.tier === 'ha' ? { inputProps: { min: 700 } } : {},
				validation: z.coerce.number()
			}
		] as const satisfies Fields;

		const values = { tier: 'ha', storageGB: '16' };

		// Without the values there is no dynamic limit to apply.
		expect(zodSchema(dynamic).safeParse(values).success).toBe(true);
		expect(zodSchema(dynamic, undefined, values).safeParse(values).success).toBe(false);
	});

	it('rejects a value that is not among the resolved options', () => {
		const select = [
			{
				type: 'select',
				name: 'memory',
				label: 'Memory',
				dynamic: (values: Record<string, string>) => ({
					options: values.tier === 'ha' ? [{ value: 'gb16' }] : [{ value: 'gb2' }]
				}),
				validation: z.string()
			}
		] as const satisfies Fields;

		const values = { tier: 'ha', memory: 'gb2' };

		expect(zodSchema(select, undefined, values).safeParse(values).success).toBe(false);
		expect(
			zodSchema(select, undefined, { tier: 'ha', memory: 'gb16' }).safeParse({ memory: 'gb16' })
				.success
		).toBe(true);
	});

	it('leaves a select alone when its options are not known here', () => {
		const select = [
			{ type: 'select', name: 'environmentName', label: 'Environment', validation: z.string() }
		] as const satisfies Fields;

		expect(zodSchema(select).safeParse({ environmentName: 'anything' }).success).toBe(true);
	});

	it('applies a cross-field refinement', () => {
		const range = [
			{ type: 'number', name: 'min', label: 'Min', validation: z.coerce.number() },
			{ type: 'number', name: 'max', label: 'Max', validation: z.coerce.number() }
		] as const satisfies Fields;

		const schema = zodSchema(range, (s) =>
			s.refine((v) => v.max >= v.min, {
				path: ['max'],
				message: 'Maximum must be at least the minimum'
			})
		);

		expect(schema.safeParse({ min: '1', max: '5' }).success).toBe(true);

		const bad = schema.safeParse({ min: '5', max: '1' });
		expect(bad.success).toBe(false);
		expect(bad.error?.issues[0].path).toEqual(['max']);
		expect(bad.error?.issues[0].message).toBe('Maximum must be at least the minimum');
	});
});

describe('buildSections', () => {
	it('renders a group where its first field is declared', () => {
		const sections = buildSections(activeFields(fields, 'create'), groups);

		expect(
			sections.map((s) => (s.kind === 'group' ? s.group.name : s.fields.map((f) => f.name)))
		).toEqual([['name', 'databases', 'enabled'], 'advanced', ['notes']]);
	});

	it('ignores groups without a matching config', () => {
		const sections = buildSections(activeFields(fields, 'create'), []);

		expect(sections).toHaveLength(1);
		expect(sections[0].kind).toBe('fields');
	});
});

describe('resolveField', () => {
	const memory = {
		type: 'select',
		name: 'memory',
		label: 'Memory',
		inputProps: { required: true },
		dynamic: (values: Record<string, string>) => ({
			options: values.tier === 'ha' ? [{ value: 'gb4' }] : [{ value: 'gb2' }, { value: 'gb4' }],
			inputProps: { disabled: values.tier === '' }
		}),
		validation: z.string()
	} as const satisfies Fields[number];

	it('computes options from the current values', () => {
		expect(resolveField(memory, { tier: 'ha' }).options).toEqual([{ value: 'gb4' }]);
		expect(resolveField(memory, { tier: 'single' }).options).toHaveLength(2);
	});

	it('merges dynamic input props over the static ones', () => {
		expect(resolveField(memory, { tier: 'single' }).inputProps).toEqual({
			required: true,
			disabled: false
		});
	});

	it('falls back to caller supplied options', () => {
		const environment = {
			type: 'select',
			name: 'environmentName',
			label: 'Environment',
			validation: z.string()
		} as const satisfies Fields[number];

		expect(resolveField(environment, {}, { environmentName: [{ value: 'dev' }] }).options).toEqual([
			{ value: 'dev' }
		]);
	});
});

describe('getValue', () => {
	it('prefers submitted values over defaults', () => {
		expect(getValue({ values: { databases: 32 } }, 'databases', 16)).toBe('32');
	});

	it('stringifies defaults', () => {
		expect(getValue(null, 'databases', 16)).toBe('16');
	});

	it('falls back to an empty string', () => {
		expect(getValue(null, 'databases')).toBe('');
	});

	it('keeps a cleared field cleared instead of restoring its default', () => {
		expect(getValue({ values: { notes: '' } }, 'notes', 'hello')).toBe('');
		// An optional field parses to undefined, but the key survives the round trip.
		expect(getValue({ values: { databases: undefined } }, 'databases', 16)).toBe('');
		expect(getValue({ values: { databases: null } }, 'databases', 16)).toBe('');
	});

	it('still uses the default for a field the response never mentions', () => {
		expect(getValue({ values: { notes: 'x' } }, 'databases', 16)).toBe('16');
	});
});

describe('normalizeValues', () => {
	const storage: Record<string, Record<string, { min: number; max: number }>> = {
		single: { gb2: { min: 16, max: 16 }, gb16: { min: 350, max: 1750 } },
		ha: { gb16: { min: 700, max: 3500 } }
	};

	const dependent = [
		{
			type: 'select',
			name: 'tier',
			label: 'Tier',
			options: [{ value: 'single' }, { value: 'ha' }],
			validation: z.string()
		},
		{
			type: 'select',
			name: 'memory',
			label: 'Memory',
			dynamic: (values: Record<string, string>) => ({
				options: Object.keys(storage[values.tier] ?? {}).map((value) => ({ value }))
			}),
			validation: z.string()
		},
		{
			type: 'number',
			name: 'storageGB',
			label: 'Storage',
			dynamic: (values: Record<string, string>) => {
				const limits = storage[values.tier]?.[values.memory];
				return limits ? { inputProps: limits } : {};
			},
			validation: z.coerce.number()
		}
	] as const satisfies Fields;

	it('replaces a value that is not among the available options', () => {
		const result = normalizeValues(dependent, { tier: 'ha', memory: 'gb2', storageGB: '700' });

		expect(result.memory).toBe('gb16');
	});

	it('clamps a number below the minimum its dependencies impose', () => {
		const result = normalizeValues(dependent, { tier: 'single', memory: 'gb16', storageGB: '16' });

		expect(result.storageGB).toBe('350');
	});

	it('clamps a number above the maximum', () => {
		const result = normalizeValues(dependent, {
			tier: 'single',
			memory: 'gb16',
			storageGB: '9999'
		});

		expect(result.storageGB).toBe('1750');
	});

	it('cascades corrections through dependent fields', () => {
		// Switching to ha invalidates the memory, which in turn raises the storage minimum.
		const result = normalizeValues(dependent, { tier: 'ha', memory: 'gb2', storageGB: '16' });

		expect(result).toEqual({ tier: 'ha', memory: 'gb16', storageGB: '700' });
	});

	it('leaves the field being edited alone', () => {
		const result = normalizeValues(
			dependent,
			{ tier: 'single', memory: 'gb16', storageGB: '3' },
			undefined,
			'storageGB'
		);

		expect(result.storageGB).toBe('3');
	});

	it('does not mutate the values it is given', () => {
		const values = { tier: 'single', memory: 'gb16', storageGB: '16' };
		normalizeValues(dependent, values);

		expect(values.storageGB).toBe('16');
	});

	it('leaves values alone when options have not loaded yet', () => {
		const environment = [
			{ type: 'select', name: 'environmentName', label: 'Environment', validation: z.string() }
		] as const satisfies Fields;

		expect(normalizeValues(environment, { environmentName: 'dev' }, {}).environmentName).toBe(
			'dev'
		);
	});

	it('ignores a number field with no limits or a non-numeric value', () => {
		const plain = [
			{ type: 'number', name: 'databases', label: 'Databases', validation: z.coerce.number() }
		] as const satisfies Fields;

		expect(normalizeValues(plain, { databases: '999' }).databases).toBe('999');
		expect(normalizeValues(plain, { databases: '' }).databases).toBe('');
	});
});

describe('repeatable groups', () => {
	const envVars = [
		{
			type: 'repeat',
			name: 'env',
			label: 'Environment variables',
			fields: [
				{ type: 'text', name: 'name', label: 'Name', validation: z.string().min(1) },
				{ type: 'text', name: 'value', label: 'Value', validation: z.string() }
			]
		}
	] as const satisfies Fields;

	it('names each control by group, row and column', () => {
		expect(rowFieldName('env', 2, 'name')).toBe('env.2.name');
	});

	it('expands a group into one field per row and column', () => {
		const values = { 'env.0.name': 'A', 'env.0.value': '1', 'env.1.name': 'B', 'env.1.value': '2' };

		expect(flattenFields(envVars, values).map((f) => f.name)).toEqual([
			'env.0.name',
			'env.0.value',
			'env.1.name',
			'env.1.value'
		]);
	});

	it('always renders at least minRows', () => {
		expect(repeatRowCount(envVars[0], {})).toBe(0);
		expect(repeatRowCount({ ...envVars[0], minRows: 1 }, {})).toBe(1);
		expect(repeatRowCount({ ...envVars[0], minRows: 3 }, {})).toBe(3);
	});

	it('collects flat row names back into an array', () => {
		const collected = collectFormData(envVars, {
			'env.0.name': 'A',
			'env.0.value': '1',
			'env.1.name': 'B',
			'env.1.value': '2'
		});

		expect(collected).toEqual({
			env: [
				{ name: 'A', value: '1' },
				{ name: 'B', value: '2' }
			]
		});
	});

	it('validates rows and reports the issue against the control that produced it', () => {
		const values = { 'env.0.name': 'A', 'env.0.value': '1', 'env.1.name': '', 'env.1.value': '2' };
		const result = zodSchema(envVars).safeParse(collectFormData(envVars, values));

		expect(result.success).toBe(false);
		expect(issueKey(result.error!.issues[0].path)).toBe('env.1.name');
	});

	it('enforces the row count', () => {
		const bounded = [{ ...envVars[0], minRows: 2, maxRows: 3 }] as const satisfies Fields;
		const schema = zodSchema(bounded);

		expect(schema.safeParse({ env: [{ name: 'A', value: '' }] }).success).toBe(false);
		expect(
			schema.safeParse({
				env: [
					{ name: 'A', value: '' },
					{ name: 'B', value: '' }
				]
			}).success
		).toBe(true);
	});

	it('seeds rows from declared defaults', () => {
		expect(
			repeatDefaults(envVars[0], null, [
				{ name: 'A', value: '1' },
				{ name: 'B', value: '2' }
			])
		).toEqual({
			'env.0.name': 'A',
			'env.0.value': '1',
			'env.1.name': 'B',
			'env.1.value': '2'
		});
	});

	it('prefers the values a failed submit echoed back over the defaults', () => {
		const form = { values: { 'env.0.name': 'kept', 'env.0.value': 'typed' } };

		expect(repeatDefaults(envVars[0], form, [{ name: 'default', value: 'default' }])).toEqual({
			'env.0.name': 'kept',
			'env.0.value': 'typed'
		});
	});
});
