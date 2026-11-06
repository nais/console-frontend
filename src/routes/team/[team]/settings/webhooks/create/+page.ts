import { load_WebhookEventTypes } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const { viewerIsOwner, isAdmin } = await event.parent();
	if (!viewerIsOwner && !isAdmin) {
		error(403, 'Only team owners and global administrators can manage webhooks.');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Create webhook',
			pageHeaderTitle: 'Team Settings',
			breadcrumbs: [
				{ label: 'Team Settings', href: '/team/[team]/settings' },
				{ label: 'Webhooks', href: '/team/[team]/settings/webhooks' }
			]
		})),
		...(await load_WebhookEventTypes({ event }))
	};
}
