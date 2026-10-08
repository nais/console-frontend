import { graphql } from '$houdini';
import { requirePostgresAccess } from '#lib/domain/postgres/access.server.js';
import {
	configurationErrors,
	formString,
	postgresConfiguration,
	resourceInput
} from '#lib/domain/postgres/forms.js';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

const mutation = graphql(`
	mutation CreatePostgres($input: CreatePostgresInput!) {
		createPostgres(input: $input) {
			postgres {
				id
				name
				teamEnvironment {
					environment {
						name
					}
				}
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		await requirePostgresAccess(event, event.params.team);
		const data = await event.request.formData();
		const values = {
			name: formString(data, 'name'),
			environment: formString(data, 'environment'),
			majorVersion: formString(data, 'majorVersion'),
			...postgresConfiguration(data)
		};
		const errors = configurationErrors(values);
		if (!values.name || !values.environment || !values.majorVersion) {
			return fail(400, { ...values, errors, error: 'Name, environment and version are required.' });
		}
		if (Object.keys(errors).length)
			return fail(400, { ...values, errors, error: 'Check the resource fields below.' });
		const result = await mutation.mutate(
			{
				input: {
					name: values.name,
					teamSlug: event.params.team,
					environmentName: values.environment,
					majorVersion: values.majorVersion,
					...resourceInput(values)
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
				error: 'Could not create Postgres. Please try again.'
			});
		}
		const postgres = result.data.createPostgres.postgres;
		redirect(
			303,
			`/team/${event.params.team}/${postgres.teamEnvironment.environment.name}/postgres/${postgres.name}`
		);
	}
} satisfies Actions;
