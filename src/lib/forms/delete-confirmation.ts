import type { Fields } from '$lib/ui/Form/form';
import { z } from 'zod';

/**
 * The "type the name to confirm" field guarding a destructive action. The expected value depends on
 * the resource being deleted, so the definition is built per page rather than declared once.
 */
export const deleteConfirmationForm = (expected: string) =>
	[
		{
			type: 'text',
			name: 'name',
			label: `Confirm deletion by typing ${expected}`,
			inputProps: { required: true, autocomplete: 'off' },
			validation: z
				.string()
				.trim()
				.refine((value) => value === expected, {
					message: `Name must be exactly ${expected}.`
				})
		}
	] as const satisfies Fields;
