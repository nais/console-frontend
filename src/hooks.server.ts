import { env } from '$env/dynamic/private';
import type { Handle, HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const cookies = event.request.headers.get('cookie');
	if (
		(request.url.startsWith('http://nais-api/') ||
			request.url == import.meta.env.VITE_GRAPHQL_ENDPOINT) &&
		cookies
	) {
		request.headers.set('cookie', cookies);
	}

	return fetch(request);
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.tenantName = env.TENANT_NAME || '';
	event.locals.githubOrganization = env.GITHUB_ORGANIZATION || '';

	const response = await resolve(event, {
		filterSerializedResponseHeaders: () => true
	});

	if (response.headers.get('Link')) {
		response.headers.delete('Link');
	}
	return response;
};
