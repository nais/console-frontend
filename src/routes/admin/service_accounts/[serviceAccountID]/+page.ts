import { addPageMeta } from '$lib/utils/pageMeta';
import { get } from 'svelte/store';
import type { PageLoad } from './$types';

export async function load(event: Parameters<PageLoad>[0]) {
	const { AdminServiceAccountDetail } = await event.parent();
	const name = get(AdminServiceAccountDetail)?.data?.serviceAccount?.name ?? 'Service Account';

	return {
		...(await addPageMeta(event, {
			title: name,
			pageHeaderTitle: 'Service Accounts',
			breadcrumbs: [
				{
					label: 'Service Accounts',
					href: '/admin/service_accounts'
				}
			]
		}))
	};
}
