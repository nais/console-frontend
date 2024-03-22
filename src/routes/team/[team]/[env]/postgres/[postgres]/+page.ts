import { load_SqlInstance } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_SqlInstance({
			event,
			variables: {
				env: event.params.env,
				team: event.params.team,
				name: event.params.postgres,
				from: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
				to: new Date(Date.now())
			}
		}))
	};
};
