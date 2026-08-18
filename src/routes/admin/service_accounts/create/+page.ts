import { addPageMeta } from '#lib/utils/pageMeta.js';

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
