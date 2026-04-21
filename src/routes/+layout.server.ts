import type { SSRData } from '@urql/core';

export async function load(event) {
	let theme = event.cookies.get('theme');
	if (theme !== 'dark' && theme !== 'light') {
		theme = 'light';
	}

	// Forward the SSR cache collected by the per-request urql client (created
	// in `hooks.server.ts`) into the SvelteKit payload. The browser-side
	// `+layout.svelte` reads this back out and seeds its own urql client with
	// it, so any query that ran on the server doesn't have to be re-fetched
	// after hydration.
	const urqlState: SSRData = event.locals.urql.ssr.extractData();

	return {
		tenantName: event.locals.tenantName,
		githubOrganization: event.locals.githubOrganization,
		theme: theme as 'dark' | 'light',
		userAgent: event.request.headers.get('user-agent') || 'unknown',
		urqlState
	};
}
