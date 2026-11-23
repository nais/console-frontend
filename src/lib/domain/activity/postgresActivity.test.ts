import { render } from 'svelte/server';
import { vi } from 'vitest';
import PostgreSQLIcon from '#lib/icons/PostgreSQLIcon.svelte';
import { icons } from './activity-log-icons';
import { activityTooltip } from './activity-log-tooltip';
import { activityTextComponent } from './activityTextComponents';
import PostgresCreatedActivityLogEntryText from './shared/texts/PostgresCreatedActivityLogEntryText.svelte';
import PostgresDeletedActivityLogEntryText from './shared/texts/PostgresDeletedActivityLogEntryText.svelte';
import PostgresUpdatedActivityLogEntryText from './shared/texts/PostgresUpdatedActivityLogEntryText.svelte';
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

function entry(): ActivityLogEntry<'PostgresUpdatedActivityLogEntry'> {
	return {
		__typename: 'PostgresUpdatedActivityLogEntry',
		id: 'postgres-event',
		actor: 'user@example.com',
		createdAt: new Date('2026-10-07T12:00:00Z'),
		environmentName: 'dev-gcp',
		message: 'Database updated',
		resourceName: 'database',
		resourceType: 'POSTGRES',
		teamSlug: 'nais',
		postgresTeamSlug: 'nais',
		postgresUpdated: { updatedFields: [] }
	};
}

describe('Postgres update activity', () => {
	test.each([
		['', 'owner=team', 'set to'],
		[null, 'owner=team', 'set to'],
		['owner=team', '', 'removed (was'],
		['owner=team', null, 'removed (was'],
		['owner=old', 'owner=new', ' -> '],
		['0', 'false', ' -> '],
		['', '', 'changed'],
		[null, null, 'changed']
	])('renders label changes from %s to %s', async (oldValue, newValue, expected) => {
		const { body } = await render(PostgresUpdatedActivityLogEntryText, {
			props: {
				data: {
					...entry(),
					postgresUpdated: { updatedFields: [{ field: 'labels', oldValue, newValue }] }
				},
				mode: 'full'
			}
		});
		expect(body).toContain(expected);
		expect(body).not.toContain('settings-list');
	});

	test('hides field details in sidebar mode', async () => {
		const { body } = await render(PostgresUpdatedActivityLogEntryText, {
			props: {
				data: {
					...entry(),
					postgresUpdated: {
						updatedFields: [{ field: 'labels', oldValue: '', newValue: 'owner=team' }]
					}
				},
				mode: 'sidebar'
			}
		});
		expect(body).not.toContain('Updated fields');
		expect(body).not.toContain('owner=team');
	});
});

describe('Postgres database activity', () => {
	test.each([
		['PostgresCreatedActivityLogEntry', PostgresCreatedActivityLogEntryText],
		['PostgresUpdatedActivityLogEntry', PostgresUpdatedActivityLogEntryText],
		['PostgresDeletedActivityLogEntry', PostgresDeletedActivityLogEntryText]
	] as const)('registers an icon, tooltip and presenter for %s', (type, presenter) => {
		expect(icons[type]).toBe(PostgreSQLIcon);
		expect(activityTooltip(type)).toBe('Postgres');
		expect(activityTextComponent(type)).toBe(presenter);
	});

	test('renders database updates with metadata and a sidebar link', async () => {
		const { body } = await render(PostgresUpdatedActivityLogEntryText, {
			props: { data: entry(), mode: 'sidebar' }
		});
		expect(body).toContain('<strong>database</strong>');
		expect(body).toContain('updated');
		expect(body).toContain('in dev-gcp');
		expect(body).toContain('user@example.com');
		expect(body).toContain('/team/nais/activity-log?activityTypes=POSTGRES_UPDATED');
		expect(body).toContain('resourceTypes=POSTGRES');
		expect(body).toContain('id=postgres-event');
	});
});
