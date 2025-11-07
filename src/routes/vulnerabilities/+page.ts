import { load_TenantVulnerabilites, OrderDirection, TeamOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta.js';

const rows = 20;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	const interval = event.url.searchParams.get('interval') ?? '7d';

	return {
		interval,
		...(await addPageMeta(event, {
			title: 'Tenant Vulnerabilities'
		})),
		...(await load_TenantVulnerabilites({
			event,
			variables: {
				orderBy: {
					field: urlToOrderField(TeamOrderField, TeamOrderField.RISK_SCORE, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
