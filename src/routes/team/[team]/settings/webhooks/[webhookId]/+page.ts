import {
	load_TeamWebhookActivity,
	load_TeamWebhookDeliveries,
	load_WebhookEventTypes
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';

const rows = 20;

export async function load(event) {
	const parent = await event.parent();
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const [deliveries, eventTypes, activity] = await Promise.all([
		load_TeamWebhookDeliveries({
			event,
			variables: {
				id: event.params.webhookId,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}),
		load_WebhookEventTypes({ event, blocking: true }),
		load_TeamWebhookActivity({ event, variables: { id: event.params.webhookId } })
	]);
	const node = get(parent.WebhookSettings).data?.node;
	const name = node?.__typename === 'WebhookSubscription' ? node.name : 'Webhook';

	return {
		...(await addPageMeta(event, {
			title: name,
			pageHeaderTitle: 'Team Settings',
			breadcrumbs: [
				{ label: 'Team Settings', href: '/team/[team]/settings' },
				{ label: 'Webhooks', href: '/team/[team]/settings/webhooks' }
			]
		})),
		...deliveries,
		...eventTypes,
		...activity
	};
}
