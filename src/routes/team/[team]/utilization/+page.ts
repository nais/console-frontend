import { load_TeamResourceUsage } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_TeamResourceUsage({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
};
