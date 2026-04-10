import { load_App } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.app })),
		...(await load_App({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
