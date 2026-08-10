import { graphql } from '$houdini';
import { maxAtLeastMin, resizeApplicationForm } from '$lib/forms/workload';
import { formAction } from '$lib/server/form';

const mutation = graphql(`
	mutation ResizeApplication($input: UpdateApplicationInput!) {
		updateApplication(input: $input) {
			application {
				name
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: resizeApplicationForm,
		refine: maxAtLeastMin,
		mutation,
		variables: ({ data, params }) => ({
			input: {
				teamSlug: params.team,
				environmentName: params.env,
				name: params.app,
				replicas: { min: data.min, max: data.max }
			}
		}),
		message: 'Failed to resize application',
		// The two fields are folded into a `replicas` input, so errors come back under that name.
		rename: { 'replicas.min': 'min', 'replicas.max': 'max' },
		redirectTo: ({ params }) => `/team/${params.team}/${params.env}/app/${params.app}`
	})
};
