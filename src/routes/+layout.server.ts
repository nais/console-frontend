import { UserInfoStore } from '$houdini';
import type { LayoutServerLoad } from './$houdini';

export const load: LayoutServerLoad = async (event) => {
	const ui = new UserInfoStore();
	const userInfo = await ui.fetch({ event });

	return {
		UserInfo: userInfo,
		tenantName: event.locals.tenantName
	};
};
