import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TenantVulnerabilitesQuery } from './tenantVulnerabilities';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities'
		})),
		TenantVulnerabilites: await runQuery(event, TenantVulnerabilitesQuery, {
			first: 1 // We only need the summary, not the teams list
		})
	};
}
