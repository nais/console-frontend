import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { logger } = vi.hoisted(() => ({
	logger: {
		error: vi.fn(),
		info: vi.fn(),
		warn: vi.fn()
	}
}));

vi.mock('$app/env/private', () => ({
	GITHUB_ORGANIZATION: 'nais',
	GRAPHQL_ENDPOINT: 'http://api.example.com/graphql',
	TENANT_NAME: 'tenant'
}));
vi.mock('#lib/logger.js', () => ({ logger }));

import { handle, handleFetch } from './hooks.server';

function handleFetchEvent(url: string, cookie?: string) {
	return {
		event: {
			request: new Request('https://console.example.com', {
				headers: cookie ? { cookie } : undefined
			})
		},
		request: new Request(url),
		fetch: vi.fn(async (request: Request) => new Response(request.url))
	} as unknown as Parameters<typeof handleFetch>[0];
}

function handleEvent(status = 200, headers?: HeadersInit) {
	const event = {
		locals: {},
		request: new Request('https://console.example.com/team/nais?tab=apps', {
			headers: { 'user-agent': 'test-agent' }
		}),
		url: new URL('https://console.example.com/team/nais?tab=apps')
	};
	const resolve = vi.fn(async () => new Response(null, { status, headers }));

	return {
		event: event as unknown as Parameters<typeof handle>[0]['event'],
		resolve: resolve as unknown as Parameters<typeof handle>[0]['resolve']
	};
}

describe('handleFetch', () => {
	it('rewrites GraphQL requests and forwards the incoming cookie', async () => {
		const input = handleFetchEvent('https://console.example.com/graphql', 'session=abc');

		await handleFetch(input);

		expect(input.fetch).toHaveBeenCalledOnce();
		const request = vi.mocked(input.fetch).mock.calls[0][0] as Request;
		expect(request.url).toBe('http://api.example.com/graphql');
		expect(request.headers.get('cookie')).toBe('session=abc');
	});

	it('does not rewrite or add cookies to unrelated requests', async () => {
		const input = handleFetchEvent('https://assets.example.com/app.js', 'session=abc');

		await handleFetch(input);

		const request = vi.mocked(input.fetch).mock.calls[0][0] as Request;
		expect(request.url).toBe('https://assets.example.com/app.js');
		expect(request.headers.has('cookie')).toBe(false);
	});
});

describe('handle', () => {
	beforeEach(() => {
		vi.spyOn(Date, 'now').mockReturnValue(1_000);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it('sets locals and security headers while removing Link', async () => {
		const input = handleEvent(200, { Link: '</app.js>; rel=preload' });

		const response = await handle(input);

		expect(input.event.locals).toEqual({
			githubOrganization: 'nais',
			tenantName: 'tenant'
		});
		expect(input.resolve).toHaveBeenCalledWith(
			input.event,
			expect.objectContaining({ filterSerializedResponseHeaders: expect.any(Function) })
		);
		const options = vi.mocked(input.resolve).mock.calls[0][1];
		expect(options?.filterSerializedResponseHeaders?.('x-test', 'value')).toBe(true);
		expect(response.headers.get('Link')).toBeNull();
		expect(response.headers.get('X-Frame-Options')).toBe('DENY');
		expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
		expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
		expect(response.headers.get('Permissions-Policy')).toBe(
			'camera=(), microphone=(), geolocation=()'
		);
	});

	it.each([
		{ status: 404, method: 'warn' },
		{ status: 500, method: 'error' }
	] as const)('logs $status responses with logger.$method', async ({ status, method }) => {
		const input = handleEvent(status);

		await handle(input);

		expect(logger[method]).toHaveBeenCalledWith(
			{
				duration: 0,
				method: 'GET',
				status,
				url: '/team/nais?tab=apps',
				userAgent: 'test-agent'
			},
			'request failed'
		);
	});

	it('logs successful requests that take longer than one second', async () => {
		vi.spyOn(Date, 'now').mockReturnValueOnce(1_000).mockReturnValueOnce(2_001);
		const input = handleEvent();

		await handle(input);

		expect(logger.info).toHaveBeenCalledWith(
			expect.objectContaining({ duration: 1_001, status: 200 }),
			'slow request'
		);
	});
});
