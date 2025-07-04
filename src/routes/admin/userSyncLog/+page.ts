import { load_UserSyncLogs } from '$houdini';

export async function load(event) {
	return {
		...(await load_UserSyncLogs({
			event
		}))
	};
}
