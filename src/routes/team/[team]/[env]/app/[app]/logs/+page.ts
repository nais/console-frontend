import { load_Instances } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export const ssr = false;

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Logs'
		})),
		...(await load_Instances({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
