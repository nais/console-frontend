import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OpenSearchOrderField, OrderDirection } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { error } from '@sveltejs/kit';
import { format, startOfMonth, subMonths } from 'date-fns';
import { OpenSearchQuery } from './opensearch';

const rows = 25;

export async function load(event) {
	const parent = await event.parent();

	// `UserInfo` is now a plain `{ data, errors }` object exposed by the
	// urql-backed root `+layout.ts` (see `runQuery`); no Svelte store unwrap
	// is needed anymore.
	if (parent.UserInfo.data?.features.openSearch.enabled === false) {
		error(404, 'OpenSearch not enabled');
	}

	return {
		...(await addPageMeta(event, { title: 'OpenSearch Instances' })),
		OpenSearch: await runQuery(event, OpenSearchQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(OpenSearchOrderField, OpenSearchOrderField.ISSUES, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...readCursorPagination(event.url, rows),
			// `Date` scalar is `YYYY-MM-DD` on the wire. Houdini auto-formatted
			// JS `Date` instances; with urql we serialize explicitly.
			from: format(startOfMonth(subMonths(new Date(), 12)), 'yyyy-MM-dd'),
			to: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
		})
	};
}
