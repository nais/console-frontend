import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import ActivityLogListItem from '../list-items/ActivityLogListItem.svelte';

const fixture = vi.hoisted(() => ({ data: {} }));

vi.mock('$houdini', () => ({
	graphql: () => ({}),
	fragment: () => readable(fixture.data)
}));
vi.mock('$app/state', () => ({
	page: { url: new URL('https://console.example.com/team/nais/activity-log') }
}));

describe('Postgres activity SSR team mapping', () => {
	test.each([
		['PostgresBranchCreatedActivityLogEntry', 'POSTGRES_BRANCH_CREATED'],
		['PostgresBranchActivatedActivityLogEntry', 'POSTGRES_BRANCH_ACTIVATED'],
		['PostgresBranchDeletedActivityLogEntry', 'POSTGRES_BRANCH_DELETED'],
		['PostgresDeletedActivityLogEntry', 'POSTGRES_DELETED'],
		['PostgresGrantAccessActivityLogEntry', 'POSTGRES_GRANT_ACCESS']
	])(
		'links %s using the concrete alias without an interface teamSlug',
		async (__typename, activityType) => {
			fixture.data = {
				__typename,
				id: 'event',
				actor: 'user@example.com',
				createdAt: new Date('2026-10-07T12:00:00Z'),
				environmentName: 'dev-gcp',
				resourceName: 'database',
				resourceType: 'POSTGRES',
				postgresTeamSlug: 'nais',
				postgresBranch: { branch: 'restore', sourceBranch: null, targetTime: null },
				postgresGrantAccessData: {
					grantee: 'user@example.com',
					until: new Date('2026-10-08T12:00:00Z')
				}
			};
			const { body } = await render(ActivityLogListItem, {
				props: {
					item: { ' $fragments': { ActivityLogEntryFragment: {} } },
					mode: 'sidebar'
				}
			});
			expect(body).toContain(`/team/nais/activity-log?activityTypes=${activityType}`);
			expect(body).toContain('environments=dev-gcp');
			expect(body).toContain('resourceTypes=POSTGRES');
			expect(body).toContain('id=event');
		}
	);
});
