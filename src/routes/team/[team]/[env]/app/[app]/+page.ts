import { load_App, load_AppInstances } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta.js';

const rows = 6;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: event.params.app })),
		...(await load_App({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		})),
		...(await load_AppInstances({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
