import { error } from '@sveltejs/kit';
import { readable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { load as loadAccess } from '../../../routes/team/[team]/settings/webhooks/+layout.js';
import { load as loadList } from '../../../routes/team/[team]/settings/webhooks/+page.js';
import { load as loadSettings } from '../../../routes/team/[team]/settings/webhooks/[webhookId]/+layout.js';
import { load as loadDetails } from '../../../routes/team/[team]/settings/webhooks/[webhookId]/+page.js';
import { load as loadCreate } from '../../../routes/team/[team]/settings/webhooks/create/+page.js';
import { load as loadEdit } from '../../../routes/team/[team]/settings/webhooks/[webhookId]/edit/+page.js';

const mocks = vi.hoisted(() => ({
	access: vi.fn(),
	list: vi.fn(),
	listActivity: vi.fn(),
	settings: vi.fn(),
	deliveries: vi.fn(),
	activity: vi.fn(),
	eventTypes: vi.fn()
}));

vi.mock('$houdini', () => ({
	load_WebhookManagementAccess: mocks.access,
	load_TeamWebhooks: mocks.list,
	load_TeamWebhooksActivity: mocks.listActivity,
	load_WebhookSettings: mocks.settings,
	load_TeamWebhookDeliveries: mocks.deliveries,
	load_TeamWebhookActivity: mocks.activity,
	load_WebhookEventTypes: mocks.eventTypes
}));
vi.mock('#lib/utils/pageMeta.js', () => ({ addPageMeta: async () => ({ meta: {} }) }));

function access(viewerIsMember = false, viewerIsOwner = false, isAdmin = false) {
	mocks.access.mockResolvedValue({
		WebhookManagementAccess: readable({
			data: { team: { viewerIsMember, viewerIsOwner }, me: { __typename: 'User', isAdmin } },
			errors: null
		})
	});
}

function event(parent: () => Promise<Record<string, unknown>> = vi.fn().mockResolvedValue({})) {
	const params: { team: string; webhookId?: string } = {
		team: 'my-team',
		webhookId: 'webhook-id'
	};
	return {
		params,
		url: new URL('https://console.example.com/team/my-team/settings/webhooks'),
		parent
	};
}

const routes = {
	list: (parent = vi.fn().mockResolvedValue({})) =>
		loadList(event(parent) as Parameters<typeof loadList>[0]),
	settings: (parent = vi.fn().mockResolvedValue({})) =>
		loadSettings(event(parent) as Parameters<typeof loadSettings>[0]),
	details: (parent = vi.fn().mockResolvedValue({})) =>
		loadDetails(event(parent) as Parameters<typeof loadDetails>[0]),
	create: (parent = vi.fn().mockResolvedValue({})) =>
		loadCreate(event(parent) as Parameters<typeof loadCreate>[0]),
	edit: (parent = vi.fn().mockResolvedValue({})) =>
		loadEdit(event(parent) as Parameters<typeof loadEdit>[0])
};

beforeEach(() => {
	vi.resetAllMocks();
	access();
	mocks.settings.mockResolvedValue({
		WebhookSettings: readable({
			data: {
				node: { __typename: 'WebhookSubscription', teamSlug: 'my-team', name: 'Notifications' }
			},
			errors: null
		})
	});
	for (const mock of [
		mocks.list,
		mocks.listActivity,
		mocks.deliveries,
		mocks.activity,
		mocks.eventTypes
	]) {
		mock.mockResolvedValue({});
	}
});

describe('webhook read authorization', () => {
	it('rejects direct links from viewers outside the owning team', async () => {
		await expect(loadAccess(event() as Parameters<typeof loadAccess>[0])).rejects.toMatchObject({
			status: 403
		});
		expect(mocks.settings).not.toHaveBeenCalled();
		expect(mocks.deliveries).not.toHaveBeenCalled();
	});

	it.each([
		[true, false, false],
		[false, true, false],
		[false, false, true]
	])('allows member=%s owner=%s admin=%s with a fresh check', async (...flags) => {
		access(...flags);
		const input = event() as Parameters<typeof loadAccess>[0];
		await expect(loadAccess(input)).resolves.toEqual({});
		expect(mocks.access).toHaveBeenCalledWith({
			event: input,
			variables: { team: 'my-team' },
			blocking: true
		});
	});

	it('fails explicitly when access cannot be verified', async () => {
		mocks.access.mockResolvedValue({
			WebhookManagementAccess: readable({ data: null, errors: [{ message: 'API unavailable' }] })
		});
		await expect(loadAccess(event() as Parameters<typeof loadAccess>[0])).rejects.toMatchObject({
			status: 500
		});
	});

	it.each(Object.entries(routes))(
		'%s waits for parent authorization before requesting protected data',
		async (_name, load) => {
			const parent = vi.fn(async () => error(403, 'Access denied.'));
			await expect(load(parent)).rejects.toMatchObject({ status: 403 });
			for (const mock of [
				mocks.list,
				mocks.listActivity,
				mocks.settings,
				mocks.deliveries,
				mocks.activity,
				mocks.eventTypes
			]) {
				expect(mock).not.toHaveBeenCalled();
			}
		}
	);

	it('loads the list and activity after authorization succeeds', async () => {
		await routes.list();
		expect(mocks.list).toHaveBeenCalledOnce();
		expect(mocks.listActivity).toHaveBeenCalledOnce();
	});

	it('loads deliveries and activity after the owning webhook is verified', async () => {
		const settings = await routes.settings();
		await routes.details(vi.fn().mockResolvedValue(settings));
		expect(mocks.deliveries).toHaveBeenCalledOnce();
		expect(mocks.activity).toHaveBeenCalledOnce();
		expect(mocks.eventTypes).toHaveBeenCalledOnce();
	});

	it.each([null, 'another-team'])(
		'does not expose global or other-team subscriptions (%s)',
		async (teamSlug) => {
			mocks.settings.mockResolvedValue({
				WebhookSettings: readable({
					data: { node: { __typename: 'WebhookSubscription', teamSlug } },
					errors: null
				})
			});
			await expect(routes.settings()).rejects.toMatchObject({ status: 404 });
		}
	);

	it('does not return cached configuration alongside a GraphQL error without a code', async () => {
		mocks.settings.mockResolvedValue({
			WebhookSettings: readable({
				data: { node: { __typename: 'WebhookSubscription', teamSlug: 'my-team' } },
				errors: [{ message: 'Access denied.' }]
			})
		});
		await expect(routes.settings()).rejects.toMatchObject({ status: 500 });
	});

	it.each([routes.create, routes.edit])('keeps management owner/admin-only (%s)', async (load) => {
		await expect(
			load(
				vi.fn().mockResolvedValue({
					viewerIsMember: true,
					viewerIsOwner: false,
					isAdmin: false
				})
			)
		).rejects.toMatchObject({ status: 403 });
		expect(mocks.eventTypes).not.toHaveBeenCalled();
	});
});
