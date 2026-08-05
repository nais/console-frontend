import { graphql } from '$houdini';
import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation DeletePostgres($input: DeletePostgresInput!) {
		deletePostgres(input: $input) {
			postgresDeleted
		}
	}
`);

export const actions = {
	default: formAction({
		fields: ({ params }) => deleteConfirmationForm(`${params.env}/${params.postgres}`),
		mutation,
		variables: ({ params }) => ({
			input: { name: params.postgres, environmentName: params.env, teamSlug: params.team }
		}),
		message: 'Failed to delete Postgres',
		succeeded: (result) => result.deletePostgres?.postgresDeleted === true,
		redirectTo: ({ params }) => `/team/${params.team}/postgres`
	})
};
