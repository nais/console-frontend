import { UserInfoStore } from '$houdini';
import { get } from 'svelte/store';
import { expect, it, onTestFinished, vi } from 'vitest';

vi.mock('$app/env', () => ({ browser: true, dev: false }));
vi.mock('$app/environment', () => ({ browser: true, building: false }));

it('accumulates three full membership pages with the actual Houdini store', async () => {
	const network = vi.fn<typeof fetch>(async (_input, init) => {
		const { variables } = JSON.parse(String(init?.body));
		const start = Number(variables.after ?? 0);
		const nodes = Array.from({ length: 25 }, (_, index) => {
			const number = start + index + 1;
			return {
				__typename: 'TeamMember',
				team: {
					__typename: 'Team',
					id: `membership-team-${number}`,
					slug: `membership-team-${number}`,
					purpose: ''
				}
			};
		});
		return new Response(
			JSON.stringify({
				data: {
					me: {
						__typename: 'User',
						id: 'membership-pagination-user',
						name: 'Test User',
						email: 'test@example.com',
						isAdmin: false,
						teams: {
							__typename: 'TeamMemberConnection',
							nodes,
							edges: nodes.map((node, index) => ({
								__typename: 'TeamMemberEdge',
								cursor: String(start + index + 1),
								node
							})),
							pageInfo: {
								__typename: 'PageInfo',
								hasNextPage: start + 25 < 75,
								hasPreviousPage: start > 0,
								startCursor: String(start + 1),
								endCursor: String(start + 25),
								totalCount: 75
							}
						}
					},
					features: {
						__typename: 'Features',
						id: 'features',
						unleash: { __typename: 'FeatureUnleash', id: 'unleash', enabled: false },
						valkey: { __typename: 'FeatureValkey', id: 'valkey', enabled: false },
						kafka: { __typename: 'FeatureKafka', id: 'kafka', enabled: false },
						openSearch: { __typename: 'FeatureOpenSearch', id: 'openSearch', enabled: false }
					}
				}
			}),
			{ headers: { 'content-type': 'application/json' } }
		);
	});
	const store = new UserInfoStore();
	await store.fetch({ fetch: network, policy: 'NetworkOnly' });
	onTestFinished(store.subscribe(() => {}));
	for (const expectedCount of [25, 50, 75]) {
		const result = get(store);
		expect(result.errors).toBeNull();
		if (result.data?.me.__typename !== 'User') throw new Error('Expected user memberships');
		expect(result.data.me.teams.nodes).toHaveLength(expectedCount);
		expect(result.data.me.teams.nodes.map((node) => node.team.slug)).toEqual(
			Array.from({ length: expectedCount }, (_, index) => `membership-team-${index + 1}`)
		);
		expect(result.data.me.teams.pageInfo.endCursor).toBe(String(expectedCount));
		expect(result.data.me.teams.pageInfo.hasNextPage).toBe(expectedCount < 75);
		if (expectedCount < 75) await store.loadNextPage({ fetch: network });
	}
	expect(network).toHaveBeenCalledTimes(3);
});
