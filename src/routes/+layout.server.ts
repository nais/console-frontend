import { LEGACY_DEPLOY_DISABLED, V0S_VULNERABILITIES_ENABLED } from '$app/env/private';

export async function load(event) {
	if (!['', 'false', 'true'].includes(LEGACY_DEPLOY_DISABLED)) {
		throw new Error('LEGACY_DEPLOY_DISABLED must be true or false');
	}
	if (!['', 'false', 'true'].includes(V0S_VULNERABILITIES_ENABLED)) {
		throw new Error('V0S_VULNERABILITIES_ENABLED must be true or false');
	}

	let theme = event.cookies.get('theme');
	if (theme !== 'dark' && theme !== 'light') {
		theme = 'light';
	}

	return {
		legacyDeployDisabled: LEGACY_DEPLOY_DISABLED === 'true',
		v0sVulnerabilities: V0S_VULNERABILITIES_ENABLED === 'true',
		tenantName: event.locals.tenantName,
		githubOrganization: event.locals.githubOrganization,
		theme: theme as 'dark' | 'light',
		userAgent: event.request.headers.get('user-agent') || 'unknown'
	};
}
