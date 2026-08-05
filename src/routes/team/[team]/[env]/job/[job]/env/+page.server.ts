import { graphql } from '$houdini';
import { uniqueVariableNames, workloadEnvForm } from '$lib/forms/workload-env';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation UpdateJobEnv($input: UpdateJobInput!) {
		updateJob(input: $input) {
			job {
				name
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: workloadEnvForm,
		refine: uniqueVariableNames,
		mutation,
		variables: ({ data, params }) => ({
			input: {
				teamSlug: params.team,
				environmentName: params.env,
				name: params.job,
				environmentVariables: data.variables
			}
		}),
		message: 'Failed to update environment variables',
		// The API names the input `environmentVariables`; the form field it came from is `variables`.
		rename: { environmentVariables: 'variables' },
		redirectTo: ({ params }) => `/team/${params.team}/${params.env}/job/${params.job}`
	})
};
