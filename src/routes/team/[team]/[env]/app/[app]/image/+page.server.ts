import { graphql } from '$houdini';
import { setImageVersionForm } from '$lib/forms/workload';
import { formAction } from '$lib/server/form';

// The offered versions come from the deploy history, so the server has to load it too. Without it
// the action would accept any image reference the client cared to submit.
const releases = graphql(`
	query SetImageVersionReleases($team: Slug!, $env: String!, $app: String!) {
		team(slug: $team) {
			environment(name: $env) {
				application(name: $app) {
					history {
						image
					}
				}
			}
		}
	}
`);

const mutation = graphql(`
	mutation SetImageVersion($input: UpdateApplicationInput!) {
		updateApplication(input: $input) {
			application {
				name
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: setImageVersionForm,
		optionsOverrides: async (event) => {
			const { params } = event;
			const history = await releases.fetch({
				event,
				variables: { team: params.team!, env: params.env!, app: params.app! }
			});

			return {
				image: (history.data?.team.environment.application.history ?? []).map((release) => ({
					value: release.image,
					label: release.image
				}))
			};
		},
		mutation,
		variables: ({ data, params }) => ({
			input: {
				teamSlug: params.team,
				environmentName: params.env,
				name: params.app,
				image: data.image
			}
		}),
		message: 'Failed to set image version',
		redirectTo: ({ params }) => `/team/${params.team}/${params.env}/app/${params.app}`
	})
};
