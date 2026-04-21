import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TenantUtilizationQuery } from './utilization';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Tenant Utilization'
		})),
		TenantUtilization: await runQuery(event, TenantUtilizationQuery, {})
	};
}
