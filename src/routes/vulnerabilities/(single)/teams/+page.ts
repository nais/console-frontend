import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, TeamOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { TenantVulnerabilitesQuery } from '../tenantVulnerabilities';

const rows = 20;

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Team Security Posture'
		})),
		TenantVulnerabilites: await runQuery(event, TenantVulnerabilitesQuery, {
			orderBy: {
				field: urlToOrderField(TeamOrderField, TeamOrderField.RISK_SCORE, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...readCursorPagination(event.url, rows)
		})
	};
}
