import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Service Accounts',
			breadcrumbs: [
				{
					label: 'Settings',
					href: '/team/[team]/settings'
				}
			]
		}))
	};
}
