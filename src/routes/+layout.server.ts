import { UserInfoStore } from '$houdini';
import type { LayoutServerLoad } from './$houdini';

export const load: LayoutServerLoad = async (event) => {
	const ui = new UserInfoStore();
	const userInfo = await ui.fetch({ event });

	return {
		connected: event.url.searchParams.get('naisdevice') === 'connected',
		UserInfo: userInfo,
		tenantName: event.locals.tenantName,
		githubOrganization: event.locals.githubOrganization
	};
};
