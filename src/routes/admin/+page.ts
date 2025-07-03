import { load_AdminUsers } from '$houdini';
import type { PageLoad } from './$houdini';

export const load: PageLoad = async (event) => {
	return {
		...(await load_AdminUsers({
			event
		}))
	};
};
