import { graphql } from '$houdini';
import { requirePostgresAccess } from '#lib/domain/postgres/access.server.js';
import { postgresConfiguration, resourceInput } from '#lib/domain/postgres/forms.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const mutation = graphql(`
	mutation UpdatePostgres($input: UpdatePostgresInput!) {
		updatePostgres(input: $input) {
			postgres {
				id
				name
				highAvailability
				resources {
					cpu
					memory
					diskSize
				}
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		await requirePostgresAccess(event, event.params.team);
		const values = postgresConfiguration(await event.request.formData());
		const result = await mutation.mutate(
			{
				input: {
					name: event.params.postgres,
					teamSlug: event.params.team,
					environmentName: event.params.env,
					...resourceInput(values)
				}
			},
			{ event }
		);
		if (result.errors?.length) {
			return fail(400, { ...values, error: result.errors.map((item) => item.message).join('. ') });
		}
		if (!result.data) {
			return fail(500, { ...values, error: 'Could not update Postgres. Please try again.' });
		}
		redirect(
			303,
			`/team/${event.params.team}/${event.params.env}/postgres/${event.params.postgres}`
		);
	}
} satisfies Actions;
