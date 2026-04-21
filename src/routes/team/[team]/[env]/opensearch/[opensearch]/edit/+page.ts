import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { UpdateOpenSearchDataQuery } from './query';

export async function load(event) {
	const { parent, params } = event;

	const data = await parent();

	if (!data.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	const isManagedByConsole = !params.opensearch.startsWith(`opensearch-${params.team}-`);
	if (!isManagedByConsole) {
		error(422, `This OpenSearch instance is not managed by Console.`);
	}

	return {
		...(await addPageMeta(event, { title: 'Edit' })),
		UpdateOpenSearchData: await runQuery(event, UpdateOpenSearchDataQuery, {
			environment: event.params.env,
			team: event.params.team,
			name: event.params.opensearch
		})
	};
}
