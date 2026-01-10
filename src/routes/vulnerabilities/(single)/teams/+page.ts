import { load_TenantVulnerabilites, OrderDirection, TeamOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta.js';

const rows = 20;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Team Security Posture'
		})),
		...(await load_TenantVulnerabilites({
			event,
			blocking: true,
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
