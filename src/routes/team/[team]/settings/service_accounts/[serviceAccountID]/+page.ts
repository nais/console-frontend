import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Service Account',
			pageHeaderTitle: 'Team Settings',
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
