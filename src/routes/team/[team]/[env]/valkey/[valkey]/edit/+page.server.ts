import { graphql } from '$houdini';
import { valkeyForm } from '$lib/forms/valkey.js';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation UpdateValkey($input: UpdateValkeyInput!) {
		updateValkey(input: $input) {
			valkey {
				name
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: valkeyForm,
		mode: 'edit',
		mutation,
		variables: ({ data, params }) => ({
			input: {
				teamSlug: params.team,
				name: params.valkey,
				environmentName: params.env,
				...data
			}
		}),
		message: 'Failed to update Valkey',
		redirectTo: ({ params }) => `/team/${params.team}/${params.env}/valkey/${params.valkey}`
	})
};
