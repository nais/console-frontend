import { load_ActivityLog } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
	return {
		...(await load_ActivityLog({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
};
