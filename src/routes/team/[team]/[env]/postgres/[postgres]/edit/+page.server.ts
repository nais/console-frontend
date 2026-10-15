import { graphql } from '$houdini';
import { requirePostgresAccess } from '#lib/domain/postgres/access.server.js';
import {
	configurationErrors,
	postgresConfiguration,
	resourceInput,
	quantityInUnits,
	withoutUnchangedStorage
} from '#lib/domain/postgres/forms.js';
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

const resourcesQuery = graphql(`
	query PostgresUpdateResources($team: Slug!, $env: String!, $name: String!) {
		team(slug: $team) {
			environment(name: $env) {
				postgres(name: $name) {
					resources {
						diskSize
					}
				}
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		await requirePostgresAccess(event, event.params.team);
		const values = postgresConfiguration(await event.request.formData());
		const current = await resourcesQuery.fetch({
			event,
			variables: { team: event.params.team, env: event.params.env, name: event.params.postgres },
			policy: 'NetworkOnly'
		});
		if (current.errors?.length || !current.data) {
			return fail(500, {
				...values,
				errors: {},
				error: current.errors?.length
					? current.errors.map((item) => item.message).join('. ')
					: 'Could not verify current storage. Please try again.'
			});
		}
		const changes = withoutUnchangedStorage(
			values,
			quantityInUnits(current.data.team.environment.postgres.resources.diskSize, 'GiB')
		);
		const errors = configurationErrors(changes);
		if (Object.keys(errors).length)
			return fail(400, { ...values, errors, error: 'Check the resource fields below.' });
		const result = await mutation.mutate(
			{
				input: {
					name: event.params.postgres,
					teamSlug: event.params.team,
					environmentName: event.params.env,
					...resourceInput(changes)
				}
			},
			{ event }
		);
		if (result.errors?.length) {
			return fail(400, {
				...values,
				errors,
				error: result.errors.map((item) => item.message).join('. ')
			});
		}
		if (!result.data) {
			return fail(500, {
				...values,
				errors,
				error: 'Could not update Postgres. Please try again.'
			});
		}
		redirect(
			303,
			`/team/${event.params.team}/${event.params.env}/postgres/${event.params.postgres}`
		);
	}
} satisfies Actions;
