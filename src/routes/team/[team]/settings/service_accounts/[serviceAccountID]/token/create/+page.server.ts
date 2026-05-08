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
		const name = data.get('name') as string | null;
		const description = data.get('description') as string | null;
		const expiresAt = data.get('expiresAt') as string | null;

		if (!name || !description) {
			return fail(400, {
				error: 'Name and description are required',
				name,
				description,
				expiresAt
			});
		}

		let parsedExpiresAt: Date | undefined;
		if (expiresAt) {
			parsedExpiresAt = new Date(expiresAt);
			if (isNaN(parsedExpiresAt.getTime())) {
				return fail(400, {
					error: 'Expires at must be a valid date',
					name,
					description,
					expiresAt
				});
			}
		}

		const res = await createTokenMutation.mutate(
			{
				input: {
					serviceAccountID: event.params.serviceAccountID,
					name,
					description,
					...(parsedExpiresAt ? { expiresAt: parsedExpiresAt } : {})
				}
			},
			{ event }
		);

		if ((res.errors?.length ?? 0) > 0) {
			return fail(400, { error: res.errors![0].message, name, description, expiresAt });
		}

		if (!res.data?.createServiceAccountToken) {
			return fail(500, {
				error: 'Failed to create token',
				name,
				description,
				expiresAt
			});
		}

		return {
			success: true,
			secret: res.data.createServiceAccountToken.secret ?? null
		};
	}
};
