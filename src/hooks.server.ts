import type { HandleFetch } from '@sveltejs/kit';

export const handle: HandleFetch = async ({ event, request, fetch }) => {
	if (request.url.startsWith('http://nais-api/') && event.request.headers.has('cookie')) {
		request.headers.set('cookie', event.request.headers.get('cookie')!);
	}

	return fetch(request);
};
