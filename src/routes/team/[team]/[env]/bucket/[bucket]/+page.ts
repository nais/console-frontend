import { load_Bucket } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_Bucket({
			event,
			variables: {
				team: event.params.team,
				environment: event.params.env,
				name: event.params.bucket
			}
		}))
	};
};
