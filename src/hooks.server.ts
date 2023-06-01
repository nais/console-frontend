import type { HandleFetch, Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	request.headers.set(
		'X-Goog-Authenticated-User-Email',
		event.request.headers.get('X-Goog-Authenticated-User-Email') || ''
	);

	request.headers.set(
		'X-Goog-IAP-JWT-Assertion',
		event.request.headers.get('X-Goog-IAP-JWT-Assertion') || ''
	);
	console.log(request.url);

	return fetch(request);
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.tenantDomain = env.TENANT_DOMAIN || '';
	return await resolve(event);
};
