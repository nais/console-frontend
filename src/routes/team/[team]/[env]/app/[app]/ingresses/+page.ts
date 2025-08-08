import { load_AppIngresses } from '$houdini';

export async function load(event) {
	return {
		...(await load_AppIngresses({
			event,
			variables: {
				team: event.params.team,
				env: event.params.env,
				app: event.params.app
			}
		}))
	};
}
