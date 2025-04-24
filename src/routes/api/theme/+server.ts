import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const form = await request.formData();
	const theme = form.get('theme');
	if (typeof theme !== 'string') {
		return new Response('Invalid theme', { status: 400 });
	}

	if (theme !== 'dark' && theme !== 'light') {
		return new Response('Invalid theme', { status: 400 });
	}

	cookies.set('theme', theme, {
		path: '/',
		httpOnly: true,
		maxAge: 60 * 60 * 24 * 365 // 365 days
	});
	return new Response('Theme set', { status: 200 });
};
