import { UserInfoStore } from '$houdini';
import type { LayoutLoad } from './$houdini';

export const load: LayoutLoad = async (event) => {
	const ui = new UserInfoStore();
	const userInfo = await ui.fetch({ event });

	return {
		UserInfo: userInfo
	};
};
