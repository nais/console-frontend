import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Create',
			breadcrumbs: [
				{
					label: 'Service Accounts',
					href: '/admin/service_accounts'
				}
			]
		}))
	};
}
