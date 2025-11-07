import { load_SqlInstance } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.postgres })),
		...(await load_SqlInstance({
			event,
			variables: {
				env: event.params.env,
				team: event.params.team,
				name: event.params.postgres
			}
		}))
	};
}
