import { load_AppManifest } from '$houdini';

export async function load(event) {
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
}
