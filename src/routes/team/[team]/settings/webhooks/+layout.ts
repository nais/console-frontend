import { load_WebhookManagementAccess } from '$houdini';
import { canViewWebhooks } from '#lib/domain/webhooks/webhooks.js';
import { error } from '@sveltejs/kit';
import { get } from 'svelte/store';

export async function load(event) {
	const { WebhookManagementAccess } = await load_WebhookManagementAccess({
		event,
		variables: { team: event.params.team },
		blocking: true
	});
	const access = get(WebhookManagementAccess);
	if (access.errors?.length || !access.data) {
		error(500, 'Unable to verify webhook permissions.');
	}
	if (
		!canViewWebhooks({
			...access.data.team,
			isAdmin: access.data.me.__typename === 'User' && access.data.me.isAdmin
		})
	) {
		error(403, 'Only team members, team owners and global administrators can view webhooks.');
	}
	return {};
}
