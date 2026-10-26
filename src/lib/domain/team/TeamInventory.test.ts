import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import TeamInventory from './TeamInventory.svelte';

const fixture = vi.hoisted(() => ({ postgresBranches: 0 }));

vi.mock('$houdini', () => ({
	graphql: () =>
		readable({
			data: {
				team: {
					inventoryCounts: {
						applications: { total: 0 },
						jobs: { total: 0 },
						sqlInstances: { total: 2 },
						postgresBranches: { total: fixture.postgresBranches },
						buckets: { total: 0 },
						valkeys: { total: 0 },
						openSearches: { total: 0 },
						kafkaTopics: { total: 0 },
						bigQueryDatasets: { total: 0 },
						secrets: { total: 0 },
						configs: { total: 0 }
					}
				}
			},
			fetching: false
		})
}));

describe('TeamInventory', () => {
	test.each([0, 3])('shows Postgres only when the branch count is positive (%i)', async (count) => {
		fixture.postgresBranches = count;

		const { body } = await render(TeamInventory, { props: { teamSlug: 'test-team' } });

		if (count > 0) {
			expect(body).toMatch(
				/href="\/team\/test-team\/postgres"[^>]*>\s*<span[^>]*>Postgres<\/span>\s*<span[^>]*>3<\/span>/
			);
		} else {
			expect(body).not.toContain('href="/team/test-team/postgres"');
		}
		expect(body).toContain('href="/team/test-team/cloudsql"');
		expect(body).toContain('Cloud SQL');
	});
});
