import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { CveOrderField, OrderDirection } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { CVESQuery } from './cves';

const rows = 20;

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'CVE Database'
		})),
		CVES: await runQuery(event, CVESQuery, {
			orderBy: {
				field: urlToOrderField(CveOrderField, CveOrderField.CVSS_SCORE, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...readCursorPagination(event.url, rows)
		})
	};
}
