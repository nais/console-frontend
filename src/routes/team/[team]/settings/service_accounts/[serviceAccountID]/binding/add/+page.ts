import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const parent = await event.parent();

	if (!parent.viewerIsOwner && !parent.isAdmin) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await addPageMeta(event, {
			title: 'Add Workload Binding',
			breadcrumbs: [
				{
					label: 'Settings',
					href: '/team/[team]/settings'
				},
				{
					label: 'Service Accounts',
					href: '/team/[team]/settings/service_accounts'
				},
				{
					label: event.params.serviceAccountID,
					href: '/team/[team]/settings/service_accounts/[serviceAccountID]'
				}
			]
		}))
	};
}
