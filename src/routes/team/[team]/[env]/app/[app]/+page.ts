import { load_App, load_AppInstanceGroups } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta.js';

export async function load(event) {
	console.log({
		team: event.params.team,
		env: event.params.env,
		app: event.params.app
	});
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
		...(await load_AppInstanceGroups({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
