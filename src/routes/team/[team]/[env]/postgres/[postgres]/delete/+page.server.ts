import { graphql } from '$houdini';
import { requirePostgresAccess } from '#lib/domain/postgres/access.server.js';
import { formString } from '#lib/domain/postgres/forms.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const mutation = graphql(`
	mutation DeletePostgres($input: DeletePostgresInput!) {
		deletePostgres(input: $input) {
			deletionRequested
		}
	}
`);

export const actions = {
	default: async (event) => {
		await requirePostgresAccess(event, event.params.team);
		const name = formString(await event.request.formData(), 'name');
		const expected = `${event.params.env}/${event.params.postgres}`;
		if (name !== expected) {
			return fail(400, { name, error: `Type ${expected} to confirm deletion.` });
		}
		const result = await mutation.mutate(
			{
				input: {
					name: event.params.postgres,
					teamSlug: event.params.team,
					environmentName: event.params.env
				}
			},
			{ event }
		);
		if (result.errors?.length) {
			return fail(400, { name, error: result.errors.map((item) => item.message).join('. ') });
		}
		if (!result.data?.deletePostgres.deletionRequested) {
			return fail(500, { name, error: 'Deletion was not accepted. Please try again.' });
		}
		redirect(
			303,
			`/team/${event.params.team}/postgres?deletionRequested=${encodeURIComponent(event.params.postgres)}`
		);
	}
} satisfies Actions;
