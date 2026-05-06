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
			title: 'Service Accounts',
			breadcrumbs: [
				{
					label: 'Settings',
					href: '/team/[team]/settings'
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
