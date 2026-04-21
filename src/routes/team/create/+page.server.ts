import { graphql as gql } from '$lib/urql/gql';
import { runMutation } from '$lib/urql/mutation';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const CreateTeamMutation = gql(/* GraphQL */ `
	mutation CreateTeam($input: CreateTeamInput!) {
		createTeam(input: $input) {
			team {
				slug
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const input = {
			slug: (data.get('name') as string) || '',
			purpose: (data.get('description') as string) || '',
			slackChannel: (data.get('slackChannel') as string) || ''
		};

		const resp = await runMutation(event, CreateTeamMutation, { input });

		if (resp.errors) {
			return { input, errors: resp.errors };
		}
		if (resp.data?.createTeam.team?.slug) {
			redirect(303, `/team/${resp.data.createTeam.team.slug}`);
		}
	}
} satisfies Actions;
