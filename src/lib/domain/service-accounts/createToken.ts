import { graphql } from '$houdini';
import { fail, type RequestEvent } from '@sveltejs/kit';

export const EXPIRY_OPTIONS = [
	{ value: '3m', text: '3 months' },
	{ value: '6m', text: '6 months' },
	{ value: '1y', text: '1 year' },
	{ value: '2y', text: '2 years' },
	{ value: 'never', text: 'Never' },
	{ value: 'custom', text: 'Custom date' }
] as const;

export const DEFAULT_EXPIRY = '1y';

const PRESET_MONTHS: Record<string, number> = {
	'3m': 3,
	'6m': 6,
	'1y': 12,
	'2y': 24
};

/**
 * Resolves the submitted expiry choice into a concrete date. Computed server-side so the
 * expiry does not depend on the client's clock.
 */
export function resolveExpiry(
	expiresIn: string | null,
	expiresAt: string | null
): { date?: Date; error?: string } {
	if (expiresIn === 'never') {
		return {};
	}

	if (expiresIn === 'custom') {
		if (!expiresAt) {
			return { error: 'Choose an expiry date' };
		}
		const date = new Date(expiresAt);
		if (isNaN(date.getTime())) {
			return { error: 'Expires at must be a valid date' };
		}
		return { date };
	}

	const months = PRESET_MONTHS[expiresIn ?? ''];
	if (months === undefined) {
		return { error: 'Invalid expiry option' };
	}

	const date = new Date();
	date.setMonth(date.getMonth() + months);
	return { date };
}

const createTokenMutation = graphql(`
	mutation CreateServiceAccountTokenShared($input: CreateServiceAccountTokenInput!) {
		createServiceAccountToken(input: $input) {
			secret
			serviceAccountToken {
				id
				name
			}
		}
	}
`);

export async function createServiceAccountToken(event: RequestEvent) {
	const data = await event.request.formData();
	const name = data.get('name') as string | null;
	const description = data.get('description') as string | null;
	const expiresIn = data.get('expiresIn') as string | null;
	const expiresAt = data.get('expiresAt') as string | null;

	const formValues = { name, description, expiresIn, expiresAt };

	if (!name || !description) {
		return fail(400, { error: 'Name and description are required', ...formValues });
	}

	const expiry = resolveExpiry(expiresIn, expiresAt);
	if (expiry.error) {
		return fail(400, { error: expiry.error, ...formValues });
	}

	const res = await createTokenMutation.mutate(
		{
			input: {
				serviceAccountID: event.params.serviceAccountID!,
				name,
				description,
				...(expiry.date ? { expiresAt: expiry.date } : {})
			}
		},
		{ event }
	);

	if ((res.errors?.length ?? 0) > 0) {
		return fail(400, { error: res.errors![0].message, ...formValues });
	}

	if (!res.data?.createServiceAccountToken) {
		return fail(500, { error: 'Failed to create token', ...formValues });
	}

	return {
		success: true,
		secret: res.data.createServiceAccountToken.secret ?? null
	};
}
