import { load_DataProduct } from '$houdini';
import type { PageLoad } from './$types';

export const load: PageLoad = async (event) => {
	return {
		...(await load_DataProduct({
			event
		}))
	};
};
