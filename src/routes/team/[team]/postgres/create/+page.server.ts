import { graphql, PostgresAvailableValuesStore, PostgresRecoverySourceStore } from '$houdini';
import { parseRecoveryTime, recoveryTimeError } from '#lib/domain/postgres/recovery.js';
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
			mode: formString(data, 'mode'),
			sourcePostgres: formString(data, 'sourcePostgres'),
			targetTime: formString(data, 'targetTime'),
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
		const recovering = values.mode === 'recovery';
		if (!values.name || !values.environment || (!recovering && !values.majorVersion)) {
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
		let recovery: { sourcePostgres: string; targetTime: Date } | undefined;
		if (recovering) {
			if (!values.sourcePostgres || values.name === values.sourcePostgres) {
				return fail(400, {
					...values,
					errors,
					error: 'Select a source and a distinct new database name.'
				});
			}
			const result = await new PostgresRecoverySourceStore().fetch({
				event,
				policy: 'NetworkOnly',
				variables: { team: event.params.team, env: values.environment, name: values.sourcePostgres }
			});
			const source = result.data?.team.environment.postgres;
			if (result.errors?.length || !source) {
				return fail(400, {
					...values,
					errors,
					error: 'Could not verify the recovery source. Select a source and try again.'
				});
			}
			const timeError = recoveryTimeError(
				values.targetTime,
				source.earliestRestoreTime,
				new Date()
			);
			if (timeError) return fail(400, { ...values, errors, error: timeError });
			values.majorVersion = source.majorVersion;
			recovery = { sourcePostgres: source.name, targetTime: parseRecoveryTime(values.targetTime)! };
		} else {
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
		}
		const unknownOutcome = () =>
			fail(502, {
				...values,
				errors,
				outcomeUnknown: true,
				error:
					'The creation outcome could not be confirmed. Check whether the database exists before retrying.'
			});
		let result: Awaited<ReturnType<typeof mutation.mutate>>;
		try {
			result = await mutation.mutate(
				{
					input: {
						name: values.name,
						teamSlug: event.params.team,
						environmentName: values.environment,
						majorVersion: values.majorVersion,
						extensions: recovering ? undefined : values.extensions,
						recovery,
						labels: toLabelInput(labelRows),
						...(!recovering ? resourceInput(values) : {})
					}
				},
				{ event }
			);
		} catch {
			return unknownOutcome();
		}
		const postgres = result.data?.createPostgres?.postgres;
		if (postgres?.id && postgres.name && postgres.teamEnvironment?.environment?.name) {
			redirect(
				303,
				`/team/${event.params.team}/${postgres.teamEnvironment.environment.name}/postgres/${postgres.name}`
			);
		}
		if (result.errors?.length) {
			return fail(400, {
				...values,
				errors,
				error: result.errors.map((item) => item.message).join('. ')
			});
		}
		return unknownOutcome();
	}
} satisfies Actions;
