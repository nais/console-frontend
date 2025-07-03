import { load_AppManifest } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_AppManifest({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
};
