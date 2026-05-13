import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Create API Token',
			breadcrumbs: [
				{
					label: 'Service Accounts',
					href: '/admin/service_accounts'
				},
				{
					label: event.params.serviceAccountID,
					href: '/admin/service_accounts/[serviceAccountID]'
				}
			]
		}))
	};
}
