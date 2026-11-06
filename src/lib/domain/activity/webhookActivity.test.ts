import { render } from 'svelte/server';
import { readable } from 'svelte/store';
import { vi } from 'vitest';
import { Webhook } from '#lib/icons/index.js';
import ActivityLogListItem from '../list-items/ActivityLogListItem.svelte';
import { icons } from './activity-log-icons';
import { activityTooltip } from './activity-log-tooltip';
import { activityTextComponent } from './activityTextComponents';
import WebhookActivityLogEntryText from './shared/texts/WebhookActivityLogEntryText.svelte';

const fixture = vi.hoisted(() => ({ data: {} }));

vi.mock('$houdini', () => ({
	graphql: () => ({}),
	fragment: () => readable(fixture.data)
}));
vi.mock('$app/state', () => ({
	page: {
		url: new URL('https://console.example.com/team/nais/activity-log'),
		data: { tenantName: 'nais' }
	}
}));

const operations = [
	['WebhookCreatedActivityLogEntry', 'created', 'WEBHOOK_CREATED'],
	['WebhookDeletedActivityLogEntry', 'deleted', 'WEBHOOK_DELETED'],
	['WebhookUpdatedActivityLogEntry', 'updated', 'WEBHOOK_UPDATED']
] as const;

function entry<T extends (typeof operations)[number][0]>(__typename: T) {
	return {
		__typename,
		id: 'webhook-event',
		actor: 'user@example.com',
		createdAt: new Date('2026-11-06T07:00:00Z'),
		environmentName: null,
		message: 'Webhook activity',
		resourceName: 'webhook-id',
		webhook: { name: 'Deployment notifications' },
		resourceType: 'WEBHOOK' as const,
		teamSlug: 'nais'
	};
}

describe('Webhook activity', () => {
	test.each(operations)('registers an icon, tooltip and presenter for %s', (type) => {
		expect(icons[type]).toBe(Webhook);
		expect(activityTooltip(type)).toBe('Webhook');
		expect(activityTextComponent(type)).toBe(WebhookActivityLogEntryText);
	});

	test.each(operations)(
		'renders %s in the shared sidebar timeline with a filtered activity link',
		async (type, label, activityType) => {
			fixture.data = {
				...entry(type),
				...(type === 'WebhookUpdatedActivityLogEntry'
					? { webhookUpdated: { name: 'Deployment notifications', updatedFields: [] } }
					: {})
			};
			const { body } = await render(ActivityLogListItem, {
				props: {
					item: { ' $fragments': { ActivityLogEntryFragment: {} } },
					mode: 'sidebar',
					showTeam: true
				}
			});
			expect(body).toContain('<strong>Deployment notifications</strong>');
			expect(body).not.toContain('<strong>webhook-id</strong>');
			expect(body).toContain(label);
			expect(body).toContain('user@example.com');
			expect(body).toContain(`/team/nais/activity-log?activityTypes=${activityType}`);
			expect(body).toContain('resourceTypes=WEBHOOK');
			expect(body).toContain('id=webhook-event');
			expect(body).toContain('in team');
			expect(body).not.toContain('environments=');
		}
	);

	test('renders global entries without a broken team link', async () => {
		const { body } = await render(WebhookActivityLogEntryText, {
			props: {
				data: { ...entry('WebhookCreatedActivityLogEntry'), teamSlug: null },
				mode: 'sidebar'
			}
		});
		expect(body).toContain('<strong>Deployment notifications</strong>');
		expect(body).not.toContain('/team/');
	});

	test.each([
		['false', 'true', ' -> '],
		[null, '["nais"]', 'set to'],
		['["nais"]', null, 'removed (was'],
		['', 'value', ' -> '],
		['value', '', ' -> '],
		[null, null, 'changed']
	])('renders field changes from %s to %s', async (oldValue, newValue, expected) => {
		const { body } = await render(WebhookActivityLogEntryText, {
			props: {
				data: {
					...entry('WebhookUpdatedActivityLogEntry'),
					webhookUpdated: {
						name: 'Deployment notifications',
						updatedFields: [{ field: 'enabled', oldValue, newValue }]
					}
				}
			}
		});
		expect(body).toContain('Updated fields');
		expect(body).toContain('<code>enabled</code>');
		expect(body).toContain(expected);
	});

	test('renders redacted URL and secret changes without inventing their values', async () => {
		const { body } = await render(WebhookActivityLogEntryText, {
			props: {
				data: {
					...entry('WebhookUpdatedActivityLogEntry'),
					webhookUpdated: {
						name: 'Deployment notifications',
						updatedFields: [
							{ field: 'url', oldValue: null, newValue: null },
							{ field: 'secret', oldValue: null, newValue: null }
						]
					}
				}
			}
		});
		expect(body).toContain('<code>url</code>');
		expect(body).toContain('<code>secret</code>');
		expect(body.match(/changed/g)).toHaveLength(2);
		expect(body).not.toContain('set to');
		expect(body).not.toContain('removed (was');
	});

	test('keeps update details out of the compact sidebar summary', async () => {
		const { body } = await render(WebhookActivityLogEntryText, {
			props: {
				data: {
					...entry('WebhookUpdatedActivityLogEntry'),
					webhookUpdated: {
						name: 'Deployment notifications',
						updatedFields: [{ field: 'eventTypes', oldValue: '*', newValue: 'TEAM_UPDATED' }]
					}
				},
				mode: 'sidebar'
			}
		});
		expect(body).not.toContain('Updated fields');
		expect(body).not.toContain('TEAM_UPDATED');
	});

	test('omits empty update details', async () => {
		const { body } = await render(WebhookActivityLogEntryText, {
			props: {
				data: {
					...entry('WebhookUpdatedActivityLogEntry'),
					webhookUpdated: { name: 'Deployment notifications', updatedFields: [] }
				}
			}
		});
		expect(body).toContain('updated');
		expect(body).not.toContain('Updated fields');
	});

	test('uses the captured name after a rename and keeps name changes in the full details', async () => {
		const { body } = await render(WebhookActivityLogEntryText, {
			props: {
				data: {
					...entry('WebhookUpdatedActivityLogEntry'),
					webhookUpdated: {
						name: 'Renamed notifications',
						updatedFields: [
							{
								field: 'name',
								oldValue: 'Original notifications',
								newValue: 'Renamed notifications'
							}
						]
					}
				}
			}
		});
		expect(body).toContain('<strong>Renamed notifications</strong>');
		expect(body).toContain('<code>Original notifications</code>');
		expect(body).toContain('<code>Renamed notifications</code>');
		expect(body).not.toContain('<strong>webhook-id</strong>');
	});
});
