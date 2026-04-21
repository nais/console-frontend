import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, TeamOrderField, type TeamFilter } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TeamsQuery } from './teams';

const rows = 25;

export async function load(event) {
	let filter = event.url.searchParams.get('filter') || '';

	if (filter !== 'WITHOUT_WORKLOADS' && filter !== 'WITH_WORKLOADS' && filter !== 'ALL') {
		filter = 'ALL';
	}

	const hasWorkloads =
		filter === 'WITHOUT_WORKLOADS' ? false : filter === 'WITH_WORKLOADS' ? true : undefined;

	return {
		filter,
		...(await addPageMeta(event, { title: 'Teams' })),
		Teams: await runQuery(event, TeamsQuery, {
			...readCursorPagination(event.url, rows),
			filter: { hasWorkloads } as TeamFilter,
			orderBy: {
				field: urlToOrderField(TeamOrderField, TeamOrderField.SLUG, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			}
		})
	};
}
