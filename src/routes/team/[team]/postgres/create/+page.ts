import { load_CreatePostgresEnvironments, load_PostgresAvailableValues } from '$houdini';
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
	return {
		...(await addPageMeta(event, { title: 'Create Postgres' })),
		...environments,
		postgresOptions
	};
}
