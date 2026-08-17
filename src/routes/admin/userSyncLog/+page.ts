import { load_UserSyncLogs } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'User synchronization logs' })),
		...(await load_UserSyncLogs({
			event
		}))
	};
}
