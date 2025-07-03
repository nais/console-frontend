import type { LayoutServerLoad } from './$houdini';

export const load: LayoutServerLoad = async (event) => {
	let theme = event.cookies.get('theme');
	if (theme !== 'dark' && theme !== 'light') {
		theme = 'light';
	}

	return {
		tenantName: event.locals.tenantName,
		githubOrganization: event.locals.githubOrganization,
		theme: theme as 'dark' | 'light',
		userAgent: event.request.headers.get('user-agent') || 'unknown'
	};
};
