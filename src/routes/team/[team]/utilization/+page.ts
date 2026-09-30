import { load_TeamResourceUsage } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Utilization' })),
		...(await load_TeamResourceUsage({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
