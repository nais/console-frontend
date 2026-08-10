import { graphql } from '$houdini';
import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation DeleteApp($team: Slug!, $env: String!, $app: String!) {
		deleteApplication(input: { teamSlug: $team, environmentName: $env, name: $app }) {
			success
		}
	}
`);

export const actions = {
	default: formAction({
		fields: ({ params }) => deleteConfirmationForm(`${params.env}/${params.app}`),
		mutation,
		variables: ({ params }) => ({ team: params.team, env: params.env, app: params.app }),
		message: 'Failed to delete application',
		succeeded: (result) => result.deleteApplication.success === true,
		redirectTo: ({ params }) => `/team/${params.team}?deleted=app/${params.app}`
	})
};
