import type { HandleFetch } from '@sveltejs/kit';

export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	const cookies = event.request.headers.get('cookie');
	if (request.url.startsWith('http://nais-api/') && cookies) {
		request.headers.set('cookie', cookies);
	}

	return fetch(request);
};
