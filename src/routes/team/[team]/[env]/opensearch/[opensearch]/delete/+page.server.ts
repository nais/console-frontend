import { graphql as gql } from '$lib/urql/gql';
import { runMutation } from '$lib/urql/mutation';
import { fail, redirect } from '@sveltejs/kit';

const DeleteOpenSearchMutation = gql(/* GraphQL */ `
	mutation DeleteOpenSearch($input: DeleteOpenSearchInput!) {
		deleteOpenSearch(input: $input) {
			openSearchDeleted
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
		if (name !== params.env + '/' + params.opensearch) {
			return fail(400, {
				success: false,
				error: 'Name must be exactly ' + params.env + '/' + params.opensearch + '.',
				name
			});
		}

		const res = await runMutation(event, DeleteOpenSearchMutation, {
			input: {
				name: params.opensearch,
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
				error: 'Failed to delete OpenSearch'
			});
		}

		return redirect(303, `/team/${params.team}/opensearch`);
	}
};
