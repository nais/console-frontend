import { load_JobManifest } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_JobManifest({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job
			}
		}))
	};
};
