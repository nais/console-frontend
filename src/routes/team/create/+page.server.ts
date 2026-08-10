import { graphql } from '$houdini';
import { createTeamForm } from '$lib/forms/team';
import { formAction } from '$lib/server/form';
import type { Actions } from './$types';

const mutation = graphql(`
	mutation CreateTeam($input: CreateTeamInput!) {
		createTeam(input: $input) {
			team {
				slug
			}
		}
	}
`);

export const actions = {
	default: formAction({
		fields: createTeamForm,
		mutation,
		variables: ({ data }) => ({ input: data }),
		message: 'Failed to create team',
		succeeded: (result) => !!result.createTeam.team?.slug,
		redirectTo: ({ result }) => `/team/${result.createTeam.team!.slug}`
	})
} satisfies Actions;
