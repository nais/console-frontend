import {
	load_CreatePostgresEnvironments,
	load_PostgresAvailableValues,
	load_PostgresRecoveryBackups,
	load_PostgresRecoveryBackup,
	load_PostgresRecoverySources,
	load_PostgresRecoverySource
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { parseCloneMode } from '#lib/domain/postgres/recovery.js';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const parent = await event.parent();
	if (!parent.viewerIsMember && !parent.isAdmin) {
		error(403, 'You do not have permission to manage Postgres for this team.');
	}
	const mode = parseCloneMode(event.url.searchParams.get('mode'));
	if (mode === 'backup' && !parent.viewerIsMember) {
		error(403, 'Only team members can view Postgres backups.');
	}
	const environments = await load_CreatePostgresEnvironments({
		event,
		blocking: true,
		variables: { team: event.params.team }
	});
	const postgresOptions = await Promise.all(
		(get(environments.CreatePostgresEnvironments).data?.team.environments ?? [])
			.filter((environment) => !!environment.gcpProjectID)
			.map(async ({ environment }) => {
				const { PostgresAvailableValues } = await load_PostgresAvailableValues({
					event,
					blocking: true,
					variables: { team: event.params.team, env: environment.name }
				});
				const { data, errors } = get(PostgresAvailableValues);
				return {
					environment: environment.name,
					options: data?.team.environment.environment.availableValues,
					errors
				};
			})
	);
	const supported = (
		get(environments.CreatePostgresEnvironments).data?.team.environments ?? []
	).filter((entry) => !!entry.gcpProjectID);
	const requested = event.url.searchParams.get('environment');
	const selectedEnvironment =
		supported.find((entry) => entry.environment.name === requested)?.environment.name ??
		supported[0]?.environment.name ??
		'';
	const sourceName = event.url.searchParams.get('source') ?? '';
	const backupName = event.url.searchParams.get('backup') ?? '';
	const recoveryMode = mode === 'clone';
	const backupMode = mode === 'backup';
	const sources =
		selectedEnvironment && recoveryMode
			? await load_PostgresRecoverySources({
					event,
					blocking: true,
					variables: {
						team: event.params.team,
						env: selectedEnvironment,
						after: event.url.searchParams.get('after')
					}
				})
			: null;
	const source =
		selectedEnvironment && sourceName && recoveryMode
			? await load_PostgresRecoverySource({
					event,
					blocking: true,
					variables: { team: event.params.team, env: selectedEnvironment, name: sourceName }
				})
			: null;
	const backups =
		selectedEnvironment && backupMode
			? await load_PostgresRecoveryBackups({
					event,
					blocking: true,
					variables: {
						team: event.params.team,
						env: selectedEnvironment,
						after: event.url.searchParams.get('after')
					}
				})
			: null;
	const backup =
		selectedEnvironment && backupName && backupMode
			? await load_PostgresRecoveryBackup({
					event,
					blocking: true,
					variables: { team: event.params.team, env: selectedEnvironment, name: backupName }
				})
			: null;
	return {
		...(await addPageMeta(event, { title: 'Create Postgres' })),
		...environments,
		viewerIsMember: Boolean(parent.viewerIsMember),
		postgresOptions,
		selectedEnvironment,
		sourceName,
		backupName,
		mode,
		recoveryMode,
		backupMode,
		recoverySources: sources ? get(sources.PostgresRecoverySources) : null,
		recoverySource: source ? get(source.PostgresRecoverySource) : null,
		recoveryBackups: backups ? get(backups.PostgresRecoveryBackups) : null,
		recoveryBackup: backup ? get(backup.PostgresRecoveryBackup) : null
	};
}
