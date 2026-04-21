import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { BigQueryDatasetOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { format, startOfMonth, subMonths } from 'date-fns';
import { BigQueryDatasetsQuery } from './bigquery';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'BigQuery Datasets' })),
		BigQuery: await runQuery(event, BigQueryDatasetsQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(
					BigQueryDatasetOrderField,
					BigQueryDatasetOrderField.NAME,
					event.url
				),
				direction: urlToOrderDirection(event.url)
			},
			...readCursorPagination(event.url, rows),
			from: format(startOfMonth(subMonths(new Date(), 12)), 'yyyy-MM-dd'),
			to: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
		})
	};
}
