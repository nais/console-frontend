import { load_CVES, load_TenantVulnerabilites, OrderDirection, TeamOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 20;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	const cvesAfter = event.url.searchParams.get('cvesAfter') || '';
	const cvesBefore = event.url.searchParams.get('cvesBefore') || '';

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
		})),
		...(await load_CVES({
			event,
			blocking: true,
			variables: {
				...(cvesBefore
					? { before: cvesBefore, last: rows }
					: cvesAfter
						? { after: cvesAfter, first: rows }
						: { first: rows })
			}
		}))
	};
}
