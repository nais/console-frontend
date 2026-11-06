import { load_WebhookEventTypes } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const { viewerIsOwner, isAdmin, WebhookSettings } = await event.parent();
	if (!viewerIsOwner && !isAdmin) {
		error(403, 'Only team owners and global administrators can manage webhooks.');
	}
	const node = get(WebhookSettings).data?.node;
	const name = node?.__typename === 'WebhookSubscription' ? node.name : 'Webhook';

	return {
		...(await addPageMeta(event, {
			title: 'Edit webhook',
			pageHeaderTitle: 'Team Settings',
			breadcrumbs: [
				{ label: 'Team Settings', href: '/team/[team]/settings' },
				{ label: 'Webhooks', href: '/team/[team]/settings/webhooks' },
				{ label: name, href: '/team/[team]/settings/webhooks/[webhookId]' }
			]
		})),
		...(await load_WebhookEventTypes({ event }))
	};
}
