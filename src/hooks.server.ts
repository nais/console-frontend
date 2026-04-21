import { env } from '$env/dynamic/private';
import { logger } from '$lib/logger';
import { createUrqlClient } from '$lib/urql/client';
import type { Handle, HandleFetch } from '@sveltejs/kit';

/**
 * urql's `fetchExchange` aborts the in-flight `fetch` (and the body stream it's
 * reading) when an operation is torn down — which happens as soon as a
 * SvelteKit `load` finishes and the per-request urql `Client` goes out of
 * scope. On Node 20+, the body-stream read rejects with an `AbortError` that
 * urql has already stopped listening to, so it surfaces as an unhandled
 * rejection and crashes the dev server.
 *
 * Catching `AbortError` rejections at the process level is safe: the abort is
 * deliberate, and any consumer that actually cared about the result has
 * already received it (or its own error) through the normal urql pipeline.
 */
if (
	typeof process !== 'undefined' &&
	!(process as { __urqlAbortHandlerInstalled?: boolean }).__urqlAbortHandlerInstalled
) {
	(process as { __urqlAbortHandlerInstalled?: boolean }).__urqlAbortHandlerInstalled = true;
	process.on('unhandledRejection', (reason) => {
		if (
			reason instanceof Error &&
			(reason.name === 'AbortError' || (reason as { code?: string }).code === 'ABORT_ERR')
		) {
			return;
		}
		throw reason;
	});
}

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

	// Create one urql client per request so all `load` functions in this
	// request share a normalized cache and the same SSR exchange. The SSR
	// exchange is later serialized into the SvelteKit payload from
	// `+layout.server.ts` so the browser client can hydrate without
	// re-fetching.
	event.locals.urql = createUrqlClient({ fetch: event.fetch });

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
