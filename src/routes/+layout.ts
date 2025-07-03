import { load_UserInfo } from '$houdini';
import type { LayoutLoad } from './$houdini';

export const load: LayoutLoad = async (event) => {
	return {
		...event.data,
		...(await load_UserInfo({ event }))
	};
};
