import { load_JobManifest } from '$houdini';

export async function load(event) {
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
}
