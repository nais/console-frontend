import {
	graphql,
	OpenSearchMajorVersion,
	type OpenSearchMajorVersion$options,
	OpenSearchSize,
	type OpenSearchSize$options,
	OpenSearchTier,
	type OpenSearchTier$options
} from '$houdini';
import { fail, redirect } from '@sveltejs/kit';

const mutation = graphql(`
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

		const tier = data.get('tier') as OpenSearchTier$options | null;
		const size = data.get('size') as OpenSearchSize$options | null;
		const version = data.get('version') as OpenSearchMajorVersion$options | null;

		if (!tier || !size || !version) {
			return fail(400, {
				success: false,
				error: 'All fields are required',
				tier,
				size,
				version
			});
		}

		const res = await mutation.mutate(
			{
				input: {
					name: params.opensearch,
					environmentName: params.env,
					teamSlug: params.team,
					tier: OpenSearchTier[tier as keyof typeof OpenSearchTier],
					size: OpenSearchSize[size as keyof typeof OpenSearchSize],
					version: OpenSearchMajorVersion[version as keyof typeof OpenSearchMajorVersion]
				}
			},
			{ event }
		);

		if (res.errors?.length ?? 0 > 0) {
			return fail(400, {
				success: false,
				error: res.errors![0].message,
				tier,
				size,
				version
			});
		} else if (!res.data) {
			return fail(500, {
				success: false,
				error: 'Failed to update OpenSearch',
				tier,
				size,
				version
			});
		}

		return redirect(303, `/team/${params.team}/${params.env}/opensearch/${params.opensearch}`);
	}
};
