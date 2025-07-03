import { load_ReconcilerLogs } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_ReconcilerLogs({
			event,
			variables: {
				id: event.params.id
			}
		}))
	};
};
