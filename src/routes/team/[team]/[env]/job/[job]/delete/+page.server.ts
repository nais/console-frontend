import { graphql } from '$houdini';
import { deleteConfirmationForm } from '$lib/forms/delete-confirmation';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation DeleteJob($team: Slug!, $env: String!, $job: String!) {
		deleteJob(input: { teamSlug: $team, environmentName: $env, name: $job }) {
			success
		}
	}
`);

export const actions = {
	default: formAction({
		fields: ({ params }) => deleteConfirmationForm(`${params.env}/${params.job}`),
		mutation,
		variables: ({ params }) => ({ team: params.team, env: params.env, job: params.job }),
		message: 'Failed to delete job',
		succeeded: (result) => result.deleteJob.success === true,
		redirectTo: ({ params }) => `/team/${params.team}?deleted=job/${params.job}`
	})
};
