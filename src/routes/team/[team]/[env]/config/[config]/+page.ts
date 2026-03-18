import { load_Config } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.config })),
		...(await load_Config({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				config: event.params.config
			}
		}))
	};
}
