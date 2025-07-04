import { load_SqlInstance } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
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
};
