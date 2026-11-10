import type { TeamSwitcherSearch$input, TeamSwitcherSearch$result } from '$houdini';
import { expect, it, vi } from 'vitest';
import artifact from '../../.houdini/artifacts/TeamSwitcherSearch';
import client from '../client';

vi.mock('$app/env', () => ({ browser: true, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false }));

it('preserves the team discriminator in network and cached team-search results', async () => {
	const team = {
		id: 'T_azure',
		slug: 'azure-platform',
		purpose: 'Team Azure Platform',
		__typename: 'Team'
	};
	const network = vi.fn<typeof fetch>().mockResolvedValue(
		new Response(
			JSON.stringify({
				data: {
					search: {
						nodes: [team],
						pageInfo: {
							hasNextPage: false,
							endCursor: '42E5HD',
							__typename: 'PageInfo'
						},
						__typename: 'SearchNodeConnection'
					}
				}
			}),
			{ headers: { 'content-type': 'application/json' } }
		)
	);
	const store = client.observe<TeamSwitcherSearch$result, TeamSwitcherSearch$input>({ artifact });

	const result = await store.send({
		fetch: network,
		variables: { query: 'azure-platform' },
		policy: 'NetworkOnly'
	});

	expect(result.errors).toBeNull();
	expect(result.data?.search.nodes.filter((node) => node.__typename === 'Team')).toEqual([team]);
	const cached = await store.send({
		variables: { query: 'azure-platform' },
		policy: 'CacheOnly'
	});
	expect(cached.data?.search.nodes.filter((node) => node.__typename === 'Team')).toEqual([team]);
});
