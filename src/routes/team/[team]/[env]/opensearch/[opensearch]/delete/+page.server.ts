import { graphql } from '$houdini';
import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation DeleteOpenSearch($input: DeleteOpenSearchInput!) {
		deleteOpenSearch(input: $input) {
			openSearchDeleted
		}
	}
`);

export const actions = {
	default: formAction({
		fields: ({ params }) => deleteConfirmationForm(`${params.env}/${params.opensearch}`),
		mutation,
		variables: ({ params }) => ({
			input: { name: params.opensearch, environmentName: params.env, teamSlug: params.team }
		}),
		message: 'Failed to delete OpenSearch',
		succeeded: (result) => result.deleteOpenSearch?.openSearchDeleted === true,
		redirectTo: ({ params }) => `/team/${params.team}/opensearch`
	})
};
