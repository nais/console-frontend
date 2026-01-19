import { load_UpdateOpenSearchData } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { parent, params } = event;

	const data = await parent();

	if (!data.userIsMember) {
		error(403, 'You do not have access to this page');
	}

	const isManagedByConsole = !params.opensearch.startsWith(`opensearch-${params.team}-`);
	if (!isManagedByConsole) {
		error(422, `This OpenSearch instance is not managed by Console.`);
	}

	return {
		...(await addPageMeta(event, { title: 'Edit' })),
		...(await load_UpdateOpenSearchData({
			event,
			variables: {
				environment: event.params.env,
				team: event.params.team,
				name: event.params.opensearch
			}
		}))
	};
}
