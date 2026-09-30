import { describe, expect, it } from 'vitest';

import { GET } from './+server';

describe('isAlive', () => {
	it('returns an ok JSON response', async () => {
		const response = GET();

		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('application/json');
		await expect(response.json()).resolves.toEqual({ status: 'ok' });
	});
});
