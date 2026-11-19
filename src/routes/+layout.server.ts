import { LEGACY_DEPLOY_DISABLED } from '$app/env/private';

export async function load(event) {
	if (!['', 'false', 'true'].includes(LEGACY_DEPLOY_DISABLED)) {
		throw new Error('LEGACY_DEPLOY_DISABLED must be true or false');
	}

	let theme = event.cookies.get('theme');
	if (theme !== 'dark' && theme !== 'light') {
		theme = 'light';
	}

	return {
		legacyDeployDisabled: LEGACY_DEPLOY_DISABLED === 'true',
		tenantName: event.locals.tenantName,
		githubOrganization: event.locals.githubOrganization,
		theme: theme as 'dark' | 'light',
		userAgent: event.request.headers.get('user-agent') || 'unknown'
	};
}
