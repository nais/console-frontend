import { env } from '$env/dynamic/private';
import type { Handle, HandleFetch } from '@sveltejs/kit';
import { logger } from '$lib/logger';

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
	const logData = {
		method: event.request.method,
		url: event.url.pathname + event.url.search,
		status: response.status,
		duration,
		userAgent: event.request.headers.get('user-agent')
	};

	if (response.status >= 500) {
		logger.error(logData, 'HTTP Request');
	} else if (response.status >= 400) {
		logger.warn(logData, 'HTTP Request');
	} else {
		logger.info(logData, 'HTTP Request');
	}

	return response;
};
