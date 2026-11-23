import { graphql, PostgresAvailableValuesStore, PostgresRecoverySourceStore } from '$houdini';
import { parseCloneMode, parseInstant, resolveCloneTarget } from '#lib/domain/postgres/recovery.js';
import { labelRowsHaveErrors, rowsFromArrays, toLabelInput } from '#lib/domain/labels/labels.js';
import { requirePostgresAccess } from '#lib/domain/postgres/access.server.js';
import {
	backupRetentionError,
	parseBackupRetention
} from '#lib/domain/postgres/backupRetention.js';
import {
	cloneBaseline,
	cloneOverrides,
	extensionDelta
} from '#lib/domain/postgres/cloneConfiguration.js';
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
			backupRetentionDays: formString(data, 'backupRetentionDays'),
			...postgresConfiguration(data)
		};
		let errors = configurationErrors(values);
		const retentionError = backupRetentionError(values.backupRetentionDays);
		if (retentionError) return fail(400, { ...values, errors, error: retentionError });
		if (labelRowsHaveErrors(labelRows)) {
			return fail(400, { ...values, errors, error: 'Check the label fields below.' });
		}
		const recovering = parseCloneMode(values.mode) === 'clone';
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
		let cloneInput: ReturnType<typeof cloneOverrides> | undefined;
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
			// The browser sends the absolute instant for its local-time input; the server's own time
			// zone is never used to interpret the typed value.
			const explicit = values.targetTime ? parseInstant(formString(data, 'targetInstant')) : null;
			if (values.targetTime && !explicit) {
				return fail(400, { ...values, errors, error: 'Enter a valid target time.' });
			}
			const resolved = resolveCloneTarget(explicit, source.earliestRestoreTime, new Date());
			if ('error' in resolved) return fail(400, { ...values, errors, error: resolved.error });
			values.majorVersion = source.majorVersion;
			// Only what differs from the source is sent; everything else is inherited by the API.
			const baseline = cloneBaseline(source);
			errors = configurationErrors(values, baseline.diskSizeMin);
			if (Object.keys(errors).length) {
				return fail(400, { ...values, errors, error: 'Check the resource fields below.' });
			}
			const { added, missing } = extensionDelta(values.extensions ?? baseline.extensions, [
				...baseline.extensions
			]);
			if (missing.length) {
				return fail(400, {
					...values,
					errors,
					error: `Extensions from the source cannot be removed: ${missing.join(', ')}.`
				});
			}
			if (added.length) {
				const available = await new PostgresAvailableValuesStore().fetch({
					event,
					variables: { team: event.params.team, env: values.environment },
					policy: 'NetworkOnly'
				});
				if (available.errors?.length || !available.data) {
					return fail(500, {
						...values,
						errors,
						error: 'Could not load Postgres options for this environment.'
					});
				}
				const extensionError = extensionSelectionError(
					added,
					available.data.team.environment.environment.availableValues.postgresExtensions.values
				);
				if (extensionError) return fail(400, { ...values, errors, error: extensionError });
			}
			cloneInput = cloneOverrides(values, values.extensions, baseline);
			recovery = { sourcePostgres: source.name, targetTime: resolved.target };
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
						extensions: recovering ? cloneInput?.extensions : values.extensions,
						recovery,
						labels: toLabelInput(labelRows),
						backupRetentionDays: parseBackupRetention(values.backupRetentionDays),
						...(recovering
							? {
									cpu: cloneInput?.cpu,
									memory: cloneInput?.memory,
									diskSize: cloneInput?.diskSize,
									highAvailability: cloneInput?.highAvailability
								}
							: resourceInput(values))
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
