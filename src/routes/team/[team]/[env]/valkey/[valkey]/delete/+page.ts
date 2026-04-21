import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { DeleteValkeyDataQuery } from './query';

export async function load(event) {
	const { parent, params } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	const isManagedByConsole = !params.valkey.startsWith(`valkey-${params.team}-`);
	if (!isManagedByConsole) {
		error(422, 'This Valkey instance is not managed by Console.');
	}

	return {
		...(await addPageMeta(event, { title: 'Delete' })),
		DeleteValkeyData: await runQuery(event, DeleteValkeyDataQuery, {
			environment: event.params.env,
			team: event.params.team,
			name: event.params.valkey
		})
	};
}
