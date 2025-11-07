import { load_TenantUtilization } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Tenant Utilization'
		})),
		...(await load_TenantUtilization({
			event
		}))
	};
}
