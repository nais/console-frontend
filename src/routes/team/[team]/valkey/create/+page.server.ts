import { graphql } from '$houdini';
import { valkeyForm } from '$lib/forms/valkey.js';
import { formAction } from '$lib/server/form.js';

const mutation = graphql(`
	mutation CreateValkey($input: CreateValkeyInput!) {
		createValkey(input: $input) {
			valkey {
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
		fields: valkeyForm,
		mutation,
		variables: ({ data, params }) => ({ input: { teamSlug: params.team, ...data } }),
		message: 'Failed to create Valkey',
		redirectTo: ({ result, params }) =>
			`/team/${params.team}/${result.createValkey.valkey.teamEnvironment.environment.name}/valkey/${result.createValkey.valkey.name}`
	})
};
