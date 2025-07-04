import { load_SqlInstance } from '$houdini';

export async function load(event) {
	return {
		...(await load_SqlInstance({
			event,
			variables: {
				env: event.params.env,
				team: event.params.team,
				name: event.params.postgres
			}
		}))
	};
}
