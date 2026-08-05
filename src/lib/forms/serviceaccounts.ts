import type { Fields } from '$lib/ui/Form/form';
import { z } from 'zod';

export const serviceAccountForm = [
	{
		type: 'text',
		name: 'name',
		label: 'Service account name',
		inputProps: { required: true },
		characterWidth: 40,
		validation: z.string().min(3, { message: 'Name must be at least 3 characters long' })
	},
	{
		type: 'textarea',
		name: 'description',
		label: 'Description',
		characterWidth: 40,
		rows: 2,
		validation: z.string().min(3, { message: 'Description must be at least 3 characters long' })
	}
] as const satisfies Fields;
