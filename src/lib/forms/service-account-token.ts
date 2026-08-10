import { EXPIRY_OPTIONS } from '$lib/domain/service-accounts/tokenExpiry';
import type { Fields } from '$lib/ui/Form/form';
import { z } from 'zod';

export const serviceAccountTokenForm = [
	{
		type: 'text',
		name: 'name',
		label: 'Token name',
		inputProps: { required: true, autocomplete: 'off' },
		validation: z.string().min(1, { message: 'Token name is required' })
	},
	{
		type: 'text',
		name: 'description',
		label: 'Description',
		inputProps: { required: true, autocomplete: 'off' },
		validation: z.string().min(1, { message: 'Description is required' })
	},
	{
		type: 'select',
		name: 'expiresIn',
		label: 'Expires',
		options: EXPIRY_OPTIONS,
		// The presets are turned into a concrete date by the action, using the server's clock.
		validation: z.string()
	},
	{
		type: 'date',
		name: 'expiresAt',
		label: 'Expiry date',
		// Only a custom expiry needs a date; the presets and "never" say everything themselves.
		dynamic: (values) => ({ hidden: values.expiresIn !== 'custom' }),
		// Kept as a string so a failed submit can echo it straight back into the date input; the
		// action turns it into a Date for the mutation.
		validation: z
			.string()
			.min(1, { message: 'Choose an expiry date' })
			.refine((value) => !Number.isNaN(Date.parse(value)), {
				message: 'Expires at must be a valid date'
			})
	}
] as const satisfies Fields;

/** Deleting a token, confirmed in a dialog, so only the id of the acted-on row is submitted. */
export const deleteTokenForm = [
	{
		type: 'hidden',
		name: 'tokenId',
		validation: z.string().min(1, { message: 'Token ID is required' })
	}
] as const satisfies Fields;
