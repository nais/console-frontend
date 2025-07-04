import { load_TeamOverview } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
	return {
		...(await load_TeamOverview({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
};
