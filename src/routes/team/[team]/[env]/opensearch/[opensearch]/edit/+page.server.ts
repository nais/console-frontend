import { graphql } from '$houdini';
import { openSearchForm } from '$lib/forms/opensearch.js';
import { formAction } from '$lib/server/form';

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
	default: formAction({
		fields: openSearchForm,
		mode: 'edit',
		mutation,
		variables: ({ data, params }) => ({
			input: {
				teamSlug: params.team,
				name: params.opensearch,
				environmentName: params.env,
				...data
			}
		}),
		message: 'Failed to update OpenSearch',
		redirectTo: ({ params }) => `/team/${params.team}/${params.env}/opensearch/${params.opensearch}`
	})
};
