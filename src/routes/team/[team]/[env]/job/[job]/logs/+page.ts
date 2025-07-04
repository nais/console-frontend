import { load_RunsWithPodNames } from '$houdini';

export const ssr = false;

export async function load(event) {
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
}
