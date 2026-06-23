import { addPageMeta } from '$lib/utils/pageMeta';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export async function load(event: Parameters<PageLoad>[0]) {
	const { ServiceAccountDetail } = await event.parent();
	const name = get(ServiceAccountDetail)?.data?.serviceAccount?.name ?? 'Service Account';

	return {
		...(await addPageMeta(event, {
			title: name,
			pageHeaderTitle: 'Team Settings',
			docPath: '/operate/console/api/#service-accounts',
			breadcrumbs: [
				{
					label: 'Team Settings',
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
