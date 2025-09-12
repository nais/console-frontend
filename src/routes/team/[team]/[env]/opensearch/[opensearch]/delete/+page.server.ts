import { graphql } from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
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

		const res = await mutation.mutate(
			{
				input: {
					name: params.opensearch,
					environmentName: params.env,
					teamSlug: params.team
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message
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
