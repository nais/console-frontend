import { graphql } from '$houdini';
import { fail } from '@sveltejs/kit';

const createTokenMutation = graphql(`
	mutation CreateServiceAccountTokenPage($input: CreateServiceAccountTokenInput!) {
		createServiceAccountToken(input: $input) {
			secret
			serviceAccountToken {
				id
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const serviceAccountID = data.get('serviceAccountID') as string | null;
		const name = data.get('name') as string | null;
		const description = data.get('description') as string | null;
		const expiresAt = data.get('expiresAt') as string | null;

		if (!serviceAccountID || !name || !description) {
			return fail(400, {
				error: 'Name and description are required',
				name,
				description,
				expiresAt
			});
		}

		const res = await createTokenMutation.mutate(
			{
				input: {
					serviceAccountID,
					name,
					description,
					...(expiresAt ? { expiresAt: new Date(expiresAt) } : {})
				}
			},
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message, name, description, expiresAt });
		}

		return {
			success: true,
			secret: res.data?.createServiceAccountToken.secret ?? null
		};
	}
};
