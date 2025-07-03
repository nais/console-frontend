import { load_Secret } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_Secret({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				secret: event.params.secret
			}
		}))
	};
};
