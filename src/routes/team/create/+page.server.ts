import type { Actions } from './$types';
import { graphql } from '$houdini';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async (event) => {
		const query = graphql(`
			mutation CreateTeam($input: CreateTeamInput!) {
				createTeam(input: $input) {
					name
				}
			}
		`);
		const data = await event.request.formData();

		const resp = await query.mutate(
			{
				input: {
					name: (data.get('name') as string) || '',
					description: (data.get('description') as string) || '',
					slackChannel: (data.get('slackChannel') as string) || ''
				}
			},
			{ event }
		);
		if (resp.errors) {
			return { errors: resp.errors };
		}
		if (resp.data?.createTeam.name) {
			throw redirect(303, `/team/${resp.data.createTeam.name}`);
		}
	}
} satisfies Actions;
