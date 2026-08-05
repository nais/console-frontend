import { graphql } from '$houdini';
import { openSearchForm } from '$lib/forms/opensearch.js';
import { formAction } from '$lib/server/form.js';

const mutation = graphql(`
	mutation CreateOpenSearch($input: CreateOpenSearchInput!) {
		createOpenSearch(input: $input) {
			openSearch {
				name
				teamEnvironment {
					environment {
						name
					}
				}
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: openSearchForm,
		mutation,
		variables: ({ data, params }) => ({ input: { teamSlug: params.team, ...data } }),
		message: 'Failed to create OpenSearch',
		redirectTo: ({ result, params }) =>
			`/team/${params.team}/${result.createOpenSearch.openSearch.teamEnvironment.environment.name}/opensearch/${result.createOpenSearch.openSearch.name}`
	})
};
