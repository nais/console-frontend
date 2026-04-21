import { graphql as gql } from '$lib/urql/gql';
import { runMutation } from '$lib/urql/mutation';
import { fail, redirect } from '@sveltejs/kit';

const DeleteValkeyMutation = gql(/* GraphQL */ `
	mutation DeleteValkey($input: DeleteValkeyInput!) {
		deleteValkey(input: $input) {
			valkeyDeleted
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { params, request } = event;
		const data = await request.formData();
		const name = data.get('name') as string | null;
		if (!name) {
			return fail(400, {
				success: false,
				error: 'Name is required',
				name
			});
		}
		if (name !== params.env + '/' + params.valkey) {
			return fail(400, {
				success: false,
				error: 'Name must be exactly ' + params.env + '/' + params.valkey + '.',
				name
			});
		}

		const res = await runMutation(event, DeleteValkeyMutation, {
			input: {
				name: params.valkey,
				environmentName: params.env,
				teamSlug: params.team
			}
		});

		if (res.errors?.length) {
			return fail(400, {
				success: false,
				error: res.errors[0].message
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to delete Valkey'
			});
		}

		return redirect(303, `/team/${params.team}/valkey`);
	}
};
