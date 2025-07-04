import { load_ActivityLog } from '$houdini';

export async function load(event) {
	return {
		...(await load_ActivityLog({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
