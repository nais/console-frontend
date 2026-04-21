import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, SqlInstanceOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { format, startOfMonth, subMonths } from 'date-fns';
import { SqlInstancesQuery } from './cloudsql';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Cloud SQL Instances' })),
		SqlInstances: await runQuery(event, SqlInstancesQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(SqlInstanceOrderField, SqlInstanceOrderField.ISSUES, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.DESC)
			},
			...readCursorPagination(event.url, rows),
			from: format(startOfMonth(subMonths(new Date(), 12)), 'yyyy-MM-dd'),
			to: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
		})
	};
}
