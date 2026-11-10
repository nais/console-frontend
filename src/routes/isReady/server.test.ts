import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { logger } = vi.hoisted(() => ({
	logger: { error: vi.fn() }
}));

vi.mock('$app/env/private', () => ({ GRAPHQL_ENDPOINT: 'https://api.example.com/graphql' }));
vi.mock('#lib/logger.js', () => ({ logger }));

describe('isReady', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('reports that it is waiting when the GraphQL endpoint is unavailable', async () => {
		const fetch = vi.fn(async () => new Response(null, { status: 503 }));
		vi.stubGlobal('fetch', fetch);
		const { GET } = await import('./+server');

		const response = await GET();

		expect(response.status).toBe(503);
		await expect(response.json()).resolves.toEqual({ status: 'waiting-for-api' });
	});

	it('becomes ready when the GraphQL endpoint accepts the request', async () => {
		const fetch = vi.fn(async () => new Response(null, { status: 401 }));
		vi.stubGlobal('fetch', fetch);
		const { GET } = await import('./+server');

		const response = await GET();

		expect(fetch).toHaveBeenCalledWith('https://api.example.com/graphql', {
			method: 'POST',
			signal: expect.any(AbortSignal),
			redirect: 'error'
		});
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ status: 'ready' });
	});
});
