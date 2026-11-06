import { load_WebhookSettings } from '$houdini';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const result = await load_WebhookSettings({
		event,
		variables: { id: event.params.webhookId },
		blocking: true
	});
	const settings = get(result.WebhookSettings);
	if (settings.errors?.length) {
		error(500, 'Unable to load webhook configuration.');
	}
	const node = settings.data?.node;
	if (node?.__typename !== 'WebhookSubscription' || node.teamSlug !== event.params.team) {
		error(404, 'Webhook not found.');
	}
	return result;
}
