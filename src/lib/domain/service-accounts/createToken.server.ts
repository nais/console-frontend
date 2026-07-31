import { graphql } from '$houdini';
import { fail, type RequestEvent } from '@sveltejs/kit';
import { resolveExpiry } from './tokenExpiry';

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

	if (!name || !description) {
		return fail(400, { error: 'Name and description are required' });
	}

	const expiry = resolveExpiry(expiresIn, expiresAt);
	if (expiry.error) {
		return fail(400, { error: expiry.error });
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
		return fail(400, { error: res.errors![0].message });
	}

	if (!res.data?.createServiceAccountToken) {
		return fail(500, { error: 'Failed to create token' });
	}

	return {
		success: true,
		secret: res.data.createServiceAccountToken.secret ?? null
	};
}
