import { graphql } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
	mutation CreateServiceAccount($input: CreateServiceAccountInput!) {
		createServiceAccount(input: $input) {
			serviceAccount {
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const name = data.get('name') as string | null;
		const description = data.get('description') as string | null;

		if (!name || !description) {
			return fail(400, {
				success: false,
				error: 'Name and description are required',
				name,
				description
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name,
					description,
					teamSlug: params.team
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message,
				name,
				description
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to create service account',
				name,
				description
			});
		}

		return redirect(
			303,
			`/team/${params.team}/settings/service_accounts/${res.data.createServiceAccount.serviceAccount!.name}`
		);
	}
};
