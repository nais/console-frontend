import { render } from 'svelte/server';
import type { ComponentProps } from 'svelte';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import { PostgresOverviewStore } from '$houdini';
import Overview from '../../../routes/team/[team]/[env]/postgres/[postgres]/(single)/+page.svelte';

const fixture = vi.hoisted(() => ({ overview: {} }));

vi.mock('$app/paths', () => ({
	resolve: (_route: string, params: { team: string; env: string; postgres: string }) =>
		`/team/${params.team}/${params.env}/postgres/${params.postgres}/branches`
}));
vi.mock('$app/state', () => ({
	page: { params: { team: 'test', env: 'dev', postgres: 'database' } }
}));
vi.mock('$houdini', () => ({
	graphql: () => ({ mutate: vi.fn() }),
	PostgresOverviewStore: class {
		subscribe = readable(fixture.overview).subscribe;
	},
	paginatedFragment: () =>
		readable({ data: { activityLog: { edges: [] } }, pageInfo: { hasNextPage: false } })
}));

describe('Postgres labels', () => {
	test.each([
		[true, false, true],
		[false, true, true],
		[false, false, false]
	])('shows label editing for member=%s admin=%s: %s', async (viewerIsMember, isAdmin, canEdit) => {
		fixture.overview = {
			errors: null,
			fetching: false,
			data: {
				team: {
					environment: {
						postgres: {
							id: 'database',
							name: 'database',
							activeBranch: { id: 'main', name: 'main', state: 'AVAILABLE' },
							desiredActiveBranch: 'main',
							highAvailability: false,
							majorVersion: '18',
							resources: { cpu: '100m', memory: '512Mi', diskSize: '10Gi' },
							workloads: { nodes: [], pageInfo: { totalCount: 0 } },
							labels: [{ key: 'owner', value: 'team' }]
						}
					}
				}
			}
		};
		const data = {
			teamSlug: 'test',
			viewerIsMember,
			isAdmin,
			PostgresOverview: new PostgresOverviewStore()
		};
		const { body } = await render(Overview, {
			props: {
				data: data as ComponentProps<typeof Overview>['data'],
				params: { team: 'test', env: 'dev', postgres: 'database' }
			}
		});
		expect(body).toContain('owner=team');
		expect(body.includes('aria-label="Edit labels"')).toBe(canEdit);
	});
});
