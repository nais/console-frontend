import { render } from 'svelte/server';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import Form from './Form.svelte';
import { graphqlIssues } from '$lib/server/form';
import { serviceAccountTokenForm } from '$lib/forms/service-account-token';
import { workloadEnvForm } from '$lib/forms/workload-env';
import type { Fields } from './form';
import { activeFields, CHECKBOX_ON, zodSchema } from './form';

const fields = [
	{ type: 'text', name: 'name', label: 'Name', createOnly: true, validation: z.string() },
	{
		type: 'number',
		name: 'databases',
		label: 'Databases',
		group: 'advanced',
		validation: z.coerce.number().optional()
	},
	{ type: 'checkbox', name: 'enabled', label: 'Enabled', validation: z.boolean() },
	{
		type: 'select',
		name: 'tier',
		label: 'Tier',
		options: [{ value: 'single', label: 'Single' }, { value: 'ha' }],
		validation: z.enum(['single', 'ha'])
	},
	{ type: 'textarea', name: 'notes', label: 'Notes', validation: z.string().optional() },
	{ type: 'radio', name: 'mode', label: 'Mode', validation: z.string() }
] as const satisfies Fields;

const groups = [{ name: 'advanced', label: 'Advanced options', collapsible: true }];

describe('<Form>', () => {
	it('renders every field type', () => {
		const { body } = render(Form, {
			props: {
				fields,
				groups,
				form: null,
				defaultValues: { tier: 'ha', databases: 16 },
				optionsOverrides: { mode: [{ value: 'a' }, { value: 'b' }] }
			}
		});

		expect(body).toContain('name="name"');
		expect(body).toContain('Advanced options');
		expect(body).toContain('<textarea');
		expect(body).toContain('type="radio"');
		// unchecked checkboxes must still submit a value
		expect(body).toContain('type="hidden" name="enabled"');
		expect(body).toContain('value="16"');
		expect(body).toContain('<option value="ha"');
		// labels are rendered as markup, never leaked onto the element as an attribute
		expect(body).not.toContain('label="');
	});

	it('hides createOnly fields in edit mode', () => {
		const { body } = render(Form, {
			props: {
				fields,
				groups,
				form: null,
				mode: 'edit',
				optionsOverrides: { mode: [{ value: 'a' }] }
			}
		});

		expect(body).not.toContain('name="name"');
	});

	it('summarises errors and links them to their field', () => {
		const { body } = render(Form, {
			props: {
				fields,
				groups,
				form: {
					error: 'Something broke',
					errors: [{ code: 'custom', path: ['tier'], message: 'Please select a tier' }],
					values: { tier: 'single' }
				},
				optionsOverrides: { mode: [{ value: 'a' }] }
			}
		});

		expect(body).toContain('Please select a tier');
		expect(body).toContain('Something broke');
		expect(body).toMatch(/href="#[^"]*-tier"/);
		expect(body).toMatch(/id="[^"]*-tier"/);
	});

	it('still shows errors that cannot be linked to a visible field', () => {
		const { body } = render(Form, {
			props: {
				fields,
				groups,
				mode: 'edit',
				form: {
					errors: [
						// a refinement on the object as a whole
						{ code: 'custom', path: [], message: 'Max must be greater than min' },
						// a field that is hidden in this mode
						{ code: 'custom', path: ['name'], message: 'Name is taken' }
					],
					values: {}
				},
				optionsOverrides: { mode: [{ value: 'a' }] }
			}
		});

		expect(body).toContain('Max must be greater than min');
		expect(body).toContain('Name is taken');
	});

	it('renders API errors on the control that caused them', () => {
		// The payload the API actually returns: `extensions.field` names the offending input, and
		// the same field can collect more than one error.
		const errors = graphqlIssues([
			{ message: 'Name must not be empty.', path: ['createValkey'], extensions: { field: 'name' } },
			{
				message: 'Name must consist of lowercase letters, numbers, and hyphens only.',
				path: ['createValkey'],
				extensions: { field: 'name' }
			},
			{
				message: 'A team slug must be at least 3 characters long.',
				path: ['createValkey', 'input', 'teamSlug']
			}
		]);

		const { body } = render(Form, {
			props: {
				fields,
				groups,
				form: { error: 'Could not create Valkey', errors, values: {} },
				optionsOverrides: { mode: [{ value: 'a' }] }
			}
		});

		// linked to the control, first message wins for the single inline slot
		expect(body).toMatch(/id="[^"]*-name"/);
		expect(body).toContain('Name must not be empty.');
		// `teamSlug` comes from the route, not a control, so it can only surface as a form-level error
		expect(body).toContain('A team slug must be at least 3 characters long.');
	});
});

describe('<Form> conditional fields', () => {
	const conditional = [
		{ type: 'hidden', name: 'workloadName', validation: z.string() },
		{ type: 'text', name: 'created', label: 'Created', editOnly: true, validation: z.string() },
		{ type: 'checkbox', name: 'custom', label: 'Custom', validation: z.boolean() },
		{
			type: 'text',
			name: 'value',
			label: 'Value',
			dynamic: (values: Record<string, string>) => ({ hidden: values.custom !== CHECKBOX_ON }),
			validation: z.string()
		}
	] as const satisfies Fields;

	it('submits hidden fields without rendering a control for them', () => {
		const { body } = render(Form, {
			props: {
				fields: conditional,
				form: null,
				defaultValues: { workloadName: 'my-app' },
				optionsOverrides: {}
			}
		});

		expect(body).toContain('type="hidden" name="workloadName"');
		expect(body).toContain('value="my-app"');
	});

	it('shows editOnly fields only in edit mode', () => {
		const props = { fields: conditional, form: null, optionsOverrides: {} } as const;

		expect(render(Form, { props }).body).not.toContain('name="created"');
		expect(render(Form, { props: { ...props, mode: 'edit' } }).body).toContain('name="created"');
	});

	it('drops fields a dynamic condition hides', () => {
		const props = { fields: conditional, form: null, optionsOverrides: {} } as const;

		expect(render(Form, { props }).body).not.toContain('name="value"');
		expect(render(Form, { props: { ...props, defaultValues: { custom: true } } }).body).toContain(
			'name="value"'
		);
	});
});

describe('<Form> initial values', () => {
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

	// A stored instance can sit outside the range its tier and memory currently allow. Rendering it
	// as-is leaves a select with nothing selected and a number input the browser refuses to submit.
	it('normalizes defaults that conflict with the constraints they render under', () => {
		const { body } = render(Form, {
			props: {
				fields: dependent,
				form: null,
				defaultValues: { tier: 'ha', memory: 'gb2', storageGB: 16 },
				optionsOverrides: {}
			}
		});

		const input = body.match(/<input[^>]*name="storageGB"[^>]*>/)?.[0] ?? '';
		expect(input).toContain('min="700"');
		expect(input).toContain('value="700"');
		expect(body).toMatch(/<option[^>]*value="gb16"[^>]*selected/);
	});

	it('normalizes values echoed back by a failed submit', () => {
		const { body } = render(Form, {
			props: {
				fields: dependent,
				form: { error: 'nope', values: { tier: 'single', memory: 'gb16', storageGB: 9999 } },
				optionsOverrides: {}
			}
		});

		expect(body.match(/<input[^>]*name="storageGB"[^>]*>/)?.[0]).toContain('value="1750"');
	});
});

// The service account token form is the smallest real definition in the codebase and is free of
// Houdini imports, so it can stand in for a consumer here.
describe('<Form> with a real field definition', () => {
	it('renders the declared control types and keeps a failed submit editable', () => {
		const { body } = render(Form, {
			props: {
				fields: serviceAccountTokenForm,
				button: 'Create token',
				form: {
					errors: [
						{ code: 'custom', path: ['expiresAt'], message: 'Expires at must be a valid date' }
					],
					values: {
						name: 'ci',
						description: 'CI pipeline',
						expiresIn: 'custom',
						expiresAt: 'yesterday'
					}
				},
				optionsOverrides: {}
			}
		});

		expect(body).toContain('type="date"');
		expect(body).toContain('value="yesterday"');
		expect(body).toContain('Expires at must be a valid date');
		expect(body).toContain('Create token');
	});

	it('validates the same way on the client as the action will', () => {
		// A date is only asked for, and only validated, when the expiry is a custom one, so the
		// fields are narrowed by the submitted values exactly like the action narrows them.
		const parse = (values: Record<string, string>) =>
			zodSchema(activeFields(serviceAccountTokenForm, 'create', values)).safeParse(values).success;

		expect(parse({ name: '', description: 'x', expiresIn: '365d' })).toBe(false);
		expect(parse({ name: 'ci', description: 'x', expiresIn: '365d' })).toBe(true);
		expect(parse({ name: 'ci', description: 'x', expiresIn: 'never' })).toBe(true);
		expect(parse({ name: 'ci', description: 'x', expiresIn: '5w' })).toBe(false);
		expect(parse({ name: 'ci', description: 'x', expiresIn: 'custom', expiresAt: '' })).toBe(false);
		expect(parse({ name: 'ci', description: 'x', expiresIn: 'custom', expiresAt: 'nope' })).toBe(
			false
		);
		expect(
			parse({ name: 'ci', description: 'x', expiresIn: 'custom', expiresAt: '2030-01-01' })
		).toBe(true);
	});
	it('seeds a repeated group from defaultValues and keeps the rows removable', () => {
		const { body } = render(Form, {
			props: {
				fields: workloadEnvForm,
				form: null,
				defaultValues: { variables: [{ name: 'FOO', value: 'bar' }] },
				optionsOverrides: {}
			}
		});

		expect(body).toContain('name="variables.0.name"');
		expect(body).toContain('value="FOO"');
		expect(body).toContain('name="variables.0.value"');
		expect(body).toContain('value="bar"');
		// minRows defaults to 0, so the only row can still be removed to clear the whole group.
		expect(body).toContain('Remove');
		expect(body).not.toContain('name="variables.1.name"');
	});

	it('re-renders every submitted row of a repeated group after a failed submit', () => {
		const { body } = render(Form, {
			props: {
				fields: workloadEnvForm,
				form: {
					errors: [
						{
							code: 'custom',
							path: ['variables', 1, 'name'],
							message: '"FOO" is already set above'
						}
					],
					values: {
						'variables.0.name': 'FOO',
						'variables.0.value': '1',
						'variables.1.name': 'FOO',
						'variables.1.value': '2'
					}
				},
				defaultValues: { variables: [{ name: '', value: '' }] },
				optionsOverrides: {}
			}
		});

		expect(body).toContain('name="variables.1.name"');
		expect(body).toContain('is already set above');
		expect(body).not.toContain('name="variables.2.name"');
	});
});
