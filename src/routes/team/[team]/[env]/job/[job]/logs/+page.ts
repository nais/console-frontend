import { load_RunsWithPodNames } from '$houdini';
import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async (event) => {
	return {
		...(await load_RunsWithPodNames({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				job: event.params.job
			}
		}))
	};
};
