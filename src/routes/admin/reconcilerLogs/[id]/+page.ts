import { load_ReconcilerLogs } from '$houdini';

export async function load(event) {
	return {
		...(await load_ReconcilerLogs({
			event,
			variables: {
				id: event.params.id
			}
		}))
	};
}
