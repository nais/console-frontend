import { load_ServiceAccountDetail } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';

export async function load(event) {
	const parent = await event.parent();

	if (!parent.viewerIsMember) {
		error(403, 'You do not have access to this page');
	}

	return {
		...(await addPageMeta(event, {
			title: event.params.serviceAccount,
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
		})),
		...(await load_ServiceAccountDetail({
			event,
			variables: {
				team: event.params.team
			}
		})),
		serviceAccountName: event.params.serviceAccount
	};
}
