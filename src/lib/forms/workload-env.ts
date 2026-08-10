import type { Fields, SchemaRefinement } from '$lib/ui/Form/form';
import { z } from 'zod';

export const workloadEnvForm = [
	{
		type: 'repeat',
		name: 'variables',
		label: 'Environment variables',
		addLabel: 'Add variable',
		fields: [
			{
				type: 'text',
				name: 'name',
				label: 'Name',
				inputProps: { required: true, placeholder: 'KEY', autocomplete: 'off' },
				validation: z.string().trim().min(1, { message: 'Environment variable name is required' })
			},
			{
				type: 'text',
				name: 'value',
				label: 'Value',
				inputProps: { placeholder: 'value', autocomplete: 'off' },
				validation: z.string()
			}
		]
	}
] as const satisfies Fields;

/** Two entries with the same name would silently overwrite each other on the workload. */
export const uniqueVariableNames: SchemaRefinement<typeof workloadEnvForm> = (schema) =>
	schema.superRefine((data, ctx) => {
		const seen = new Set<string>();

		data.variables.forEach((row, index) => {
			const name = row.name.trim();
			if (!name) return;

			if (seen.has(name)) {
				ctx.addIssue({
					code: 'custom',
					path: ['variables', index, 'name'],
					message: `"${name}" is already set above`
				});
			}
			seen.add(name);
		});
	});
