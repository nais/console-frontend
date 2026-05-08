import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const data = await event.parent();

	if (!data.viewerIsOwner && !data.isAdmin) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Create',
			breadcrumbs: [
				{
					label: 'Settings',
					href: '/team/[team]/settings'
				},
				{
					label: 'Service Accounts',
					href: '/team/[team]/settings/service_accounts'
				}
			]
		}))
	};
}
