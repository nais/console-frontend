import { graphql, PostgresAvailableValuesStore } from '$houdini';
import { labelRowsHaveErrors, rowsFromArrays, toLabelInput } from '#lib/domain/labels/labels.js';
import { requirePostgresAccess } from '#lib/domain/postgres/access.server.js';
import {
	configurationErrors,
	extensionSelectionError,
	formExtensions,
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

const environmentsQuery = graphql(`
	query PostgresCreationEnvironments($team: Slug!) {
		team(slug: $team) {
			environments {
				gcpProjectID
				environment {
					name
				}
			}
		}
	}
`);

export const actions = {
	default: async (event) => {
		await requirePostgresAccess(event, event.params.team);
		const data = await event.request.formData();
		const labelRows = rowsFromArrays(
			data.getAll('label_key').map((value) => (typeof value === 'string' ? value : '')),
			data.getAll('label_value').map((value) => (typeof value === 'string' ? value : ''))
		);
		const values = {
			name: formString(data, 'name'),
			environment: formString(data, 'environment'),
			majorVersion: formString(data, 'majorVersion'),
			extensions: formExtensions(data),
			labelRows,
			...postgresConfiguration(data)
		};
		const errors = configurationErrors(values);
		if (labelRowsHaveErrors(labelRows)) {
			return fail(400, { ...values, errors, error: 'Check the label fields below.' });
		}
		if (!values.name || !values.environment || !values.majorVersion) {
			return fail(400, { ...values, errors, error: 'Name, environment and version are required.' });
		}
		const environmentsResult = await environmentsQuery.fetch({
			event,
			variables: { team: event.params.team },
			policy: 'NetworkOnly'
		});
		if (environmentsResult.errors?.length) {
			return fail(500, {
				...values,
				errors,
				error: environmentsResult.errors.map((item) => item.message).join('. ')
			});
		}
		if (!environmentsResult.data) {
			return fail(500, {
				...values,
				errors,
				error: 'Could not verify environment support. Please try again.'
			});
		}
		const selectedEnvironment = environmentsResult.data.team.environments.find(
			(environment) => environment.environment.name === values.environment
		);
		if (!selectedEnvironment?.gcpProjectID) {
			return fail(400, {
				...values,
				errors,
				error: 'Postgres is only available in GCP environments.'
			});
		}
		const available = await new PostgresAvailableValuesStore().fetch({
			event,
			variables: { team: event.params.team, env: values.environment },
			policy: 'NetworkOnly'
		});
		if (available.errors?.length || !available.data) {
			return fail(500, {
				...values,
				errors,
				error: available.errors?.length
					? available.errors.map((item) => item.message).join('. ')
					: 'Could not load Postgres options for this environment.'
			});
		}
		const options = available.data.team.environment.environment.availableValues;
		const extensionError = extensionSelectionError(
			values.extensions,
			options.postgresExtensions.values
		);
		if (!options.postgresMajorVersions.values.includes(values.majorVersion) || extensionError) {
			return fail(400, {
				...values,
				errors,
				error: extensionError ?? 'Select a PostgreSQL version available in this environment.'
			});
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
					extensions: values.extensions,
					labels: toLabelInput(labelRows),
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
