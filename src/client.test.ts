import type { HomeActivity$input, HomeActivity$result } from '$houdini';
import { vi } from 'vitest';
import artifact from '../.houdini/artifacts/HomeActivity';
import client from './client';

vi.mock('$app/env', () => ({ browser: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));

test('keeps GraphQL URLs and headers identical on SSR and hydration', async () => {
	const network = vi.fn<typeof fetch>().mockResolvedValue(
		new Response(JSON.stringify({ data: { activityLog: { nodes: [] } } }), {
			headers: { 'content-type': 'application/json' }
		})
	);
	const store = client.observe<HomeActivity$result, HomeActivity$input>({
		artifact,
		enableCache: false
	});

	const result = await store.send({
		fetch: network,
		variables: { from: new Date('2026-10-29T10:00:00Z') },
		policy: 'NetworkOnly'
	});

	expect(network).toHaveBeenCalledExactlyOnceWith(
		'/graphql',
		expect.objectContaining({
			method: 'POST',
			headers: expect.objectContaining({ 'x-houdini-request': 'true' })
		})
	);
	expect(result.errors).toBeNull();
	expect(result.data).toEqual({ activityLog: { nodes: [] } });
});
