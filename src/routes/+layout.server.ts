import { UserInfoStore } from '$houdini';
import type { LayoutServerLoad } from './$houdini';
import { preloadPricing } from '$lib/preloadPrices';

export const load: LayoutServerLoad = async (event) => {
	const ui = new UserInfoStore();
	const userInfo = await ui.fetch({ event });

	const prices = await preloadPricing(event);

	let theme = event.cookies.get('theme');
	if (theme !== 'dark' && theme !== 'light') {
		theme = 'light';
	}

	return {
		UserInfo: userInfo,
		prices,
		tenantName: event.locals.tenantName,
		githubOrganization: event.locals.githubOrganization,
		theme: theme as 'dark' | 'light'
	};
};
