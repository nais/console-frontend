import { graphql as gql } from '$lib/urql/gql';
import { OpenSearchMajorVersion, OpenSearchMemory, OpenSearchTier } from '$lib/urql/gql/graphql';
import { runMutation } from '$lib/urql/mutation';
import { fail, redirect } from '@sveltejs/kit';

const UpdateOpenSearchMutation = gql(/* GraphQL */ `
	mutation UpdateOpenSearch($input: UpdateOpenSearchInput!) {
		updateOpenSearch(input: $input) {
			openSearch {
				name
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const { request, params } = event;
		const data = await request.formData();

		const tier = data.get('tier') as keyof typeof OpenSearchTier | null;
		const memory = data.get('memory') as keyof typeof OpenSearchMemory | null;
		const version = data.get('version') as keyof typeof OpenSearchMajorVersion | null;
		const storage = data.get('storageGB') as string | null;

		const allProps = {
			tier,
			memory,
			version,
			storageGB: storage
		};

		if (!tier || !memory || !version || !storage) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'All fields are required'
			});
		}

		const storageGB = parseInt(storage, 10);
		if (isNaN(storageGB)) {
			return fail(400, {
				...allProps,
				success: false,
				error: 'Storage capacity must be a number in GB'
			});
		}

		const res = await runMutation(event, UpdateOpenSearchMutation, {
			input: {
				name: params.opensearch,
				environmentName: params.env,
				teamSlug: params.team,
				tier: OpenSearchTier[tier as keyof typeof OpenSearchTier],
				memory: OpenSearchMemory[memory as keyof typeof OpenSearchMemory],
				version: OpenSearchMajorVersion[version as keyof typeof OpenSearchMajorVersion],
				storageGB: storageGB
			}
		});

		if (res.errors?.length) {
			return fail(400, {
				...allProps,
				success: false,
				error: res.errors[0].message
			});
		} else if (!res.data) {
			return fail(500, {
				...allProps,
				success: false,
				error: 'Failed to update OpenSearch'
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/opensearch/${params.opensearch}`);
	}
};
