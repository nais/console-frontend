import { load_Secret } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.secret })),
		...(await load_Secret({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				secret: event.params.secret
			}
		}))
	};
}
