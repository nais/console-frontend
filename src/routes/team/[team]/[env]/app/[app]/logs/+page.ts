import { load_Instances } from '$houdini';
import type { PageLoad } from './$houdini';

export const ssr = false;

export const load: PageLoad = async (event) => {
	return {
		...(await load_Instances({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
};
