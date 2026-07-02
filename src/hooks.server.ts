import { env } from '$env/dynamic/private';
import { logger } from '$lib/logger';
import type { Handle, HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const targetGraphqlEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT;
	const targetGraphqlUrl = targetGraphqlEndpoint ? new URL(targetGraphqlEndpoint) : undefined;
	const requestUrl = new URL(request.url);

	if (
		targetGraphqlUrl &&
		requestUrl.pathname === targetGraphqlUrl.pathname &&
		requestUrl.origin !== targetGraphqlUrl.origin
	) {
		requestUrl.protocol = targetGraphqlUrl.protocol;
		requestUrl.hostname = targetGraphqlUrl.hostname;
		requestUrl.port = targetGraphqlUrl.port;
		request = new Request(requestUrl, request);
	}

	const cookies = event.request.headers.get('cookie');
	if (cookies && targetGraphqlUrl) {
		const outgoingUrl = new URL(request.url);
		if (
			outgoingUrl.origin === targetGraphqlUrl.origin &&
			outgoingUrl.pathname === targetGraphqlUrl.pathname
		) {
			request.headers.set('cookie', cookies);
		}
	}

	return fetch(request);
};

export const handle: Handle = async ({ event, resolve }) => {
	const startTime = Date.now();

	event.locals.tenantName = env.TENANT_NAME || '';
	event.locals.githubOrganization = env.GITHUB_ORGANIZATION || '';

	const response = await resolve(event, {
		filterSerializedResponseHeaders: () => true
	});

	if (response.headers.get('Link')) {
		response.headers.delete('Link');
	}

	const duration = Date.now() - startTime;

	// Only log errors or slow requests
	if (response.status >= 400 || duration > 1000) {
		const logData = {
			method: event.request.method,
			url: event.url.pathname + event.url.search,
			status: response.status,
			duration,
			userAgent: event.request.headers.get('user-agent')
		};

		if (response.status >= 500) {
			logger.error(logData, 'request failed');
		} else if (response.status >= 400) {
			logger.warn(logData, 'request failed');
		} else {
			logger.info(logData, 'slow request');
		}
	}

	return response;
};
