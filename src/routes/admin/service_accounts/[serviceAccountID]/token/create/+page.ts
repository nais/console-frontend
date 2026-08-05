import { addPageMeta } from '$lib/utils/pageMeta';
import { get } from 'svelte/store';

export async function load(event) {
	const { AdminServiceAccountDetail } = await event.parent();
	const name = get(AdminServiceAccountDetail)?.data?.serviceAccount?.name ?? 'Service Account';

	return {
		...(await addPageMeta(event, {
			title: 'Create API Token',
			breadcrumbs: [
				{
					label: 'Service Accounts',
					href: '/admin/service_accounts'
				},
				{
					label: name,
					href: '/admin/service_accounts/[serviceAccountID]'
				}
			]
		}))
	};
}
