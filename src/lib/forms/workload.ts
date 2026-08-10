import type { Fields, SchemaRefinement } from '$lib/ui/Form/form';
import { z } from 'zod';

export const resizeApplicationForm = [
	{
		type: 'number',
		name: 'min',
		label: 'Minimum replicas',
		characterWidth: 7,
		inputProps: { required: true, min: 0, step: 1 },
		validation: z.coerce
			.number({ message: 'Minimum replicas must be a number' })
			.int({ message: 'Minimum replicas must be a whole number' })
	},
	{
		type: 'number',
		name: 'max',
		label: 'Maximum replicas',
		characterWidth: 7,
		inputProps: { required: true, min: 0, step: 1 },
		validation: z.coerce
			.number({ message: 'Maximum replicas must be a number' })
			.int({ message: 'Maximum replicas must be a whole number' })
	}
] as const satisfies Fields;

export const maxAtLeastMin: SchemaRefinement<typeof resizeApplicationForm> = (schema) =>
	schema.refine((data) => data.max >= data.min, {
		path: ['max'],
		message: 'Maximum replicas cannot be lower than the minimum'
	});

export const setImageVersionForm = [
	{
		type: 'radio',
		name: 'image',
		label: 'Releases',
		validation: z.string().min(1, { message: 'Select an image version' })
	}
] as const satisfies Fields;
