import type { HandleFetch, Handle } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	request.headers.set(
		'X-Goog-Authenticated-User-Email',
		event.request.headers.get('X-Goog-Authenticated-User-Email') || ''
	);

	request.headers.set(
		'X-Goog-IAP-JWT-Assertion',
		event.request.headers.get('X-Goog-IAP-JWT-Assertion') || ''
	);

	if (graphqlEndpoint && env.PUBLIC_GRAPHQL_ENDPOINT) {
		if (request.url.startsWith(env.PUBLIC_GRAPHQL_ENDPOINT)) {
			// clone the original request, but change the URL
			request = new Request(
				request.url.replace(env.PUBLIC_GRAPHQL_ENDPOINT, graphqlEndpoint),
				request
			);
		}
	}

	return fetch(request);
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.tenantDomain = env.TENANT_DOMAIN || '';
	return await resolve(event);
};
