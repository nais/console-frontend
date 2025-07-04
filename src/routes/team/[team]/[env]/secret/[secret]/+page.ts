import { load_Secret } from '$houdini';

export async function load(event) {
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
}
