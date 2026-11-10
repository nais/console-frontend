import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { logger } = vi.hoisted(() => ({
	logger: { error: vi.fn() }
}));

vi.mock('$app/env/private', () => ({
	GRAPHQL_ENDPOINT: 'http://api.example.com/graphql'
}));
vi.mock('#lib/logger.js', () => ({ logger }));

import { GET as liveness } from './isAlive/+server';
import { GET as readiness } from './isReady/+server';

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
	vi.resetAllMocks();
});

describe('readiness', () => {
	it.each([200, 204, 401])('is ready when the API responds with %i', async (status) => {
		fetchMock.mockResolvedValue(new Response(null, { status }));

		const response = await readiness();

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: 'ready' });
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(fetchMock).toHaveBeenCalledWith('http://api.example.com/graphql', {
			method: 'POST',
			signal: expect.any(AbortSignal),
			redirect: 'error'
		});
	});

	it.each([302, 400, 403, 404, 500, 503])(
		'is not ready when the API responds with %i',
		async (status) => {
			fetchMock.mockResolvedValue(new Response(null, { status }));

			const response = await readiness();

			expect(response.status).toBe(503);
			expect(await response.json()).toEqual({ status: 'waiting-for-api' });
			expect(response.headers.get('Cache-Control')).toBe('no-store');
		}
	);

	it('is not ready when the API connection fails', async () => {
		const error = new TypeError('fetch failed');
		fetchMock.mockRejectedValue(error);

		const response = await readiness();

		expect(response.status).toBe(503);
		expect(logger.error).toHaveBeenCalledWith(
			{ error, url: 'http://api.example.com/graphql' },
			'Failed to check GraphQL API'
		);
	});

	it('does not retain a ready result when the next API request times out', async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
		expect((await readiness()).status).toBe(200);

		const controller = new AbortController();
		const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(controller.signal);
		fetchMock.mockImplementationOnce(
			(_input, options) =>
				new Promise((_resolve, reject) => {
					options?.signal?.addEventListener('abort', () => reject(options.signal?.reason), {
						once: true
					});
				})
		);

		const pendingResponse = readiness();
		controller.abort(new DOMException('API request timed out', 'TimeoutError'));

		expect((await pendingResponse).status).toBe(503);
		expect(timeout).toHaveBeenCalledWith(2000);
	});

	it('recovers when the API is available again', async () => {
		fetchMock
			.mockResolvedValueOnce(new Response(null, { status: 503 }))
			.mockResolvedValueOnce(new Response(null, { status: 401 }));

		expect((await readiness()).status).toBe(503);
		expect((await readiness()).status).toBe(200);
	});

	it('cancels the unused API response body', async () => {
		const apiResponse = new Response('API response');
		const cancel = vi.spyOn(apiResponse.body!, 'cancel');
		fetchMock.mockResolvedValue(apiResponse);

		expect((await readiness()).status).toBe(200);
		expect(cancel).toHaveBeenCalledOnce();
	});
});

describe('liveness', () => {
	it('responds without contacting the API even when it is unavailable', async () => {
		fetchMock.mockRejectedValue(new TypeError('API unavailable'));

		const response = liveness();

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ status: 'ok' });
		expect(response.headers.get('Cache-Control')).toBe('no-store');
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
