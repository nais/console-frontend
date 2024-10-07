import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async (event) => {
		const query = graphql(`
			mutation CreateTeam($input: CreateTeamInput!) {
				createTeam(input: $input) {
					team {
						slug
					}
				}
			}
		`);
		const data = await event.request.formData();
		const input = {
			slug: (data.get('name') as string) || '',
			purpose: (data.get('description') as string) || '',
			slackChannel: (data.get('slackChannel') as string) || ''
		};

		const resp = await query.mutate(
			{
				input
			},
			{ event }
		);
		if (resp.errors) {
			return { input, errors: resp.errors };
		}
		if (resp.data?.createTeam.team?.slug) {
			redirect(303, `/team/${resp.data.createTeam.team.slug}`);
		}
	}
} satisfies Actions;
