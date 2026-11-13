import {
	load_CreatePostgresEnvironments,
	load_PostgresAvailableValues,
	load_PostgresRecoverySources,
	load_PostgresRecoverySource
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const parent = await event.parent();
	if (!parent.viewerIsMember && !parent.isAdmin) {
		error(403, 'You do not have permission to manage Postgres for this team.');
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
	const recoveryMode = event.url.searchParams.get('mode') === 'recovery';
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
	return {
		...(await addPageMeta(event, { title: 'Create Postgres' })),
		...environments,
		postgresOptions,
		selectedEnvironment,
		sourceName,
		recoveryMode,
		recoverySources: sources ? get(sources.PostgresRecoverySources) : null,
		recoverySource: source ? get(source.PostgresRecoverySource) : null
	};
}
