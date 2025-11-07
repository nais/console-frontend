import { load_ActivityLog } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Activity Log' })),
		...(await load_ActivityLog({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
