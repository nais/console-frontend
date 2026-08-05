import { graphql } from '$houdini';
import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation DeleteValkey($input: DeleteValkeyInput!) {
		deleteValkey(input: $input) {
			valkeyDeleted
		}
	}
`);

export const actions = {
	default: formAction({
		fields: ({ params }) => deleteConfirmationForm(`${params.env}/${params.valkey}`),
		mutation,
		variables: ({ params }) => ({
			input: { name: params.valkey, environmentName: params.env, teamSlug: params.team }
		}),
		message: 'Failed to delete Valkey',
		succeeded: (result) => result.deleteValkey?.valkeyDeleted === true,
		redirectTo: ({ params }) => `/team/${params.team}/valkey`
	})
};
