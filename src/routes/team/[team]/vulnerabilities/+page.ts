import { load_TeamVulnerabilities } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_TeamVulnerabilities({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
};
