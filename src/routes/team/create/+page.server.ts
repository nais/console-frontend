import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
	default: async (event) => {
		const query = graphql(`
			mutation CreateTeam($input: CreateTeamInput!) {
				createTeam(input: $input) {
					slug
				}
			}
		`);
		const data = await event.request.formData();

		const resp = await query.mutate(
			{
				input: {
					slug: (data.get('name') as string) || '',
					purpose: (data.get('description') as string) || '',
					slackChannel: (data.get('slackChannel') as string) || ''
				}
			},
			{ event }
		);
		if (resp.errors) {
			return { errors: resp.errors };
		}
		if (resp.data?.createTeam.slug) {
			throw redirect(303, `/team/${resp.data.createTeam.slug}`);
		}
	}
} satisfies Actions;
