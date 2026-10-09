import { render } from 'svelte/server';
import { vi } from 'vitest';
import PostgreSQLIcon from '#lib/icons/PostgreSQLIcon.svelte';
import { icons } from './activity-log-icons';
import { activityTooltip } from './activity-log-tooltip';
import { activityTextComponent } from './activityTextComponents';
import PostgresBranchActivityLogEntryText from './shared/texts/PostgresBranchActivityLogEntryText.svelte';
import type { ActivityLogEntry } from './shared/texts/types';

vi.mock('$app/env', () => ({ browser: false, building: false, dev: false }));
vi.mock('$app/environment', () => ({ browser: false, building: false }));
vi.mock('$app/navigation', () => ({ goto: vi.fn(), invalidateAll: vi.fn() }));
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/nais/activity-log'),
		data: { tenantName: 'nais' }
	}
}));

const branchTypes = [
	['PostgresBranchCreatedActivityLogEntry', 'created', 'POSTGRES_BRANCH_CREATED'],
	['PostgresBranchActivatedActivityLogEntry', 'activated', 'POSTGRES_BRANCH_ACTIVATED'],
	['PostgresBranchDeletedActivityLogEntry', 'deleted', 'POSTGRES_BRANCH_DELETED']
] as const;

function entry(
	__typename: (typeof branchTypes)[number][0]
): ActivityLogEntry<'PostgresBranchCreatedActivityLogEntry'> {
	return {
		__typename,
		id: 'branch-event',
		actor: 'user@example.com',
		createdAt: new Date('2026-10-07T12:00:00Z'),
		environmentName: 'dev-gcp',
		message: 'Branch event',
		resourceName: 'database',
		resourceType: 'POSTGRES',
		teamSlug: 'nais',
		postgresTeamSlug: 'nais',
		postgresBranch: {
			branch: 'restore',
			sourceBranch: null,
			targetTime: null
		}
	};
}

describe('Postgres branch activity', () => {
	test.each(branchTypes)('registers an icon, tooltip and presenter for %s', (type) => {
		expect(icons[type]).toBe(PostgreSQLIcon);
		expect(activityTooltip(type)).toBe('Postgres');
		expect(activityTextComponent(type)).toBe(PostgresBranchActivityLogEntryText);
	});

	test.each(branchTypes)(
		'renders %s with metadata and a sidebar link',
		async (type, label, activityType) => {
			const { body } = await render(PostgresBranchActivityLogEntryText, {
				props: { data: entry(type), mode: 'sidebar' }
			});
			expect(body).toContain('<strong>restore</strong>');
			expect(body).toContain(label);
			expect(body).toContain('<strong>database</strong>');
			expect(body).toContain('in dev-gcp');
			expect(body).toContain('user@example.com');
			expect(body).toContain(`/team/nais/activity-log?activityTypes=${activityType}`);
			expect(body).toContain('resourceTypes=POSTGRES');
			expect(body).toContain('id=branch-event');
			expect(body).not.toContain('Source:');
			expect(body).not.toContain('Recovered to');
		}
	);

	test('renders creation source and recovery timestamp in UTC', async () => {
		const data = entry('PostgresBranchCreatedActivityLogEntry');
		const { body } = await render(PostgresBranchActivityLogEntryText, {
			props: {
				data: {
					...data,
					postgresBranch: {
						branch: 'restore',
						sourceBranch: 'main',
						targetTime: new Date('2026-10-06T08:15:00Z')
					}
				}
			}
		});
		expect(body).toContain('Source: <strong>main</strong>');
		expect(body).toContain('datetime="2026-10-06T08:15:00.000Z"');
		expect(body).toContain('2026-10-06 08:15:00 UTC');
	});

	test('renders activation without creation-specific fields or an environment', async () => {
		const { body } = await render(PostgresBranchActivityLogEntryText, {
			props: {
				data: {
					...entry('PostgresBranchActivatedActivityLogEntry'),
					environmentName: null,
					postgresBranch: { branch: 'main' }
				}
			}
		});
		expect(body).toContain('<strong>main</strong>');
		expect(body).not.toContain('in dev-gcp');
		expect(body).not.toContain('Source:');
		expect(body).not.toContain('Recovered to');
	});
});
