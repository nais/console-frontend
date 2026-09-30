import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { environment, logger } = vi.hoisted(() => ({
	environment: { building: true },
	logger: { error: vi.fn() }
}));

vi.mock('$app/env', () => ({
	get building() {
		return environment.building;
	}
}));
vi.mock('$app/env/private', () => ({ GRAPHQL_ENDPOINT: 'https://api.example.com/graphql' }));
vi.mock('#lib/logger.js', () => ({ logger }));

describe('isReady', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.useFakeTimers();
		environment.building = true;
	});

	afterEach(() => {
		vi.clearAllTimers();
		vi.useRealTimers();
		vi.unstubAllGlobals();
		vi.clearAllMocks();
	});

	it('reports that it is waiting before the GraphQL probe succeeds', async () => {
		const { GET } = await import('./+server');

		const response = await GET();

		expect(response.status).toBe(503);
		await expect(response.json()).resolves.toEqual({ status: 'waiting-for-api' });
	});

	it('becomes ready when the GraphQL endpoint accepts the request', async () => {
		environment.building = false;
		const fetch = vi.fn(async () => new Response(null, { status: 401 }));
		vi.stubGlobal('fetch', fetch);
		const { GET } = await import('./+server');
		await vi.advanceTimersByTimeAsync(0);

		const response = await GET();

		expect(fetch).toHaveBeenCalledWith('https://api.example.com/graphql', { method: 'POST' });
		expect(response.status).toBe(200);
		await expect(response.json()).resolves.toEqual({ status: 'ready' });
	});
});
