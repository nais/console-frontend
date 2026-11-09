import { graphql, load_WebhookManagementAccess, load_WebhookSettings } from '$houdini';
import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { get } from 'svelte/store';
import { readWebhookForm } from './webhooks.js';

type TeamEvent = RequestEvent<{ team: string }>;
type WebhookEvent = RequestEvent<{ team: string; webhookId: string }>;

const createMutation = graphql(`
	mutation CreateTeamWebhook($input: CreateWebhookInput!) {
		createWebhook(input: $input) {
			webhook {
				id
				name
			}
		}
	}
`);

const updateMutation = graphql(`
	mutation UpdateTeamWebhook($input: UpdateWebhookInput!) {
		updateWebhook(input: $input) {
			webhook {
				id
				name
				url
				allEvents
				eventTypes
				sourceTeamSlugs
				enabled
				hasSecret
				consecutiveFailures
				disabledAt
				updatedAt
			}
		}
	}
`);

const deleteMutation = graphql(`
	mutation DeleteTeamWebhook($input: DeleteWebhookInput!) {
		deleteWebhook(input: $input) {
			webhookID
		}
	}
`);

const testMutation = graphql(`
	mutation TestTeamWebhook($input: TestWebhookInput!) {
		testWebhook(input: $input) {
			delivery {
				...WebhookDeliveryFields @mask_disable
			}
		}
	}
`);

async function requireManagementAccess(event: TeamEvent, webhookId?: string) {
	const { WebhookManagementAccess } = await load_WebhookManagementAccess({
		event,
		variables: { team: event.params.team },
		blocking: true
	});
	const access = get(WebhookManagementAccess);
	if (access.errors?.length || !access.data) {
		error(500, 'Unable to verify webhook management permissions.');
	}
	if (
		!access.data.team.viewerIsOwner &&
		!(access.data.me.__typename === 'User' && access.data.me.isAdmin)
	) {
		error(403, 'Only team owners and global administrators can manage webhooks.');
	}

	if (webhookId) {
		const { WebhookSettings } = await load_WebhookSettings({
			event,
			variables: { id: webhookId },
			blocking: true
		});
		const settings = get(WebhookSettings);
		if (settings.errors?.length) {
			error(500, 'Unable to load webhook configuration.');
		}
		const node = settings.data?.node;
		if (node?.__typename !== 'WebhookSubscription' || node.teamSlug !== event.params.team) {
			error(404, 'Webhook not found.');
		}
	}
}

export async function createWebhook(event: TeamEvent) {
	await requireManagementAccess(event);
	const { fields, secret, errors } = readWebhookForm(
		await event.request.formData(),
		true,
		event.params.team
	);
	if (errors.length) {
		return fail(400, { errors, fields });
	}

	const result = await createMutation.mutate(
		{
			input: {
				name: fields.name,
				url: fields.url,
				secret,
				events:
					fields.eventScope === 'all' ? { allEvents: true } : { eventTypes: fields.eventTypes },
				teamSlug: event.params.team,
				...(fields.sourceTeamSlugs !== undefined ? { sourceTeamSlugs: fields.sourceTeamSlugs } : {})
			}
		},
		{ event }
	);
	if (result.errors?.length) {
		return fail(400, { errors: result.errors.map((e) => e.message), fields });
	}
	if (!result.data?.createWebhook.webhook) {
		return fail(500, { errors: ['Failed to create webhook.'], fields });
	}

	redirect(
		303,
		`/team/${event.params.team}/settings/webhooks/${result.data.createWebhook.webhook.id}`
	);
}

export async function updateWebhook(event: WebhookEvent) {
	await requireManagementAccess(event, event.params.webhookId);
	const { fields, secret, errors } = readWebhookForm(
		await event.request.formData(),
		false,
		event.params.team
	);
	if (errors.length) {
		return fail(400, { errors, fields });
	}

	const result = await updateMutation.mutate(
		{
			input: {
				id: event.params.webhookId,
				name: fields.name,
				url: fields.url,
				events:
					fields.eventScope === 'all' ? { allEvents: true } : { eventTypes: fields.eventTypes },
				enabled: fields.enabled,
				...(fields.sourceTeamSlugs !== undefined
					? { sourceTeamSlugs: fields.sourceTeamSlugs }
					: {}),
				...(secret ? { secret } : {})
			}
		},
		{ event }
	);
	if (result.errors?.length) {
		return fail(400, { errors: result.errors.map((e) => e.message), fields });
	}
	if (!result.data?.updateWebhook.webhook) {
		return fail(500, { errors: ['Failed to update webhook.'], fields });
	}

	redirect(303, `/team/${event.params.team}/settings/webhooks/${event.params.webhookId}`);
}

export async function deleteWebhook(event: WebhookEvent) {
	await requireManagementAccess(event, event.params.webhookId);
	const result = await deleteMutation.mutate({ input: { id: event.params.webhookId } }, { event });
	if (result.errors?.length) {
		return fail(400, { errors: result.errors.map((e) => e.message) });
	}
	if (result.data?.deleteWebhook.webhookID !== event.params.webhookId) {
		return fail(500, { errors: ['Failed to delete webhook.'] });
	}

	redirect(303, `/team/${event.params.team}/settings/webhooks`);
}

export async function enableWebhook(event: WebhookEvent) {
	await requireManagementAccess(event, event.params.webhookId);
	const result = await updateMutation.mutate(
		{ input: { id: event.params.webhookId, enabled: true } },
		{ event }
	);
	if (result.errors?.length) {
		return fail(400, { errors: result.errors.map((e) => e.message) });
	}
	if (!result.data?.updateWebhook.webhook) {
		return fail(500, { errors: ['Failed to re-enable webhook.'] });
	}

	return { success: true };
}

export async function testWebhook(event: WebhookEvent) {
	await requireManagementAccess(event, event.params.webhookId);
	const result = await testMutation.mutate({ input: { id: event.params.webhookId } }, { event });
	const testDelivery = result.data?.testWebhook.delivery;
	if (result.errors?.length) {
		return fail(400, { errors: result.errors.map((e) => e.message), testDelivery });
	}
	if (!testDelivery) {
		return fail(500, { errors: ['Failed to send a webhook test event.'] });
	}

	return { testDelivery };
}
