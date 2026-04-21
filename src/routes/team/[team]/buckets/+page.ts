import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { BucketOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { format, startOfMonth, subMonths } from 'date-fns';
import { BucketsQuery } from './buckets';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Buckets' })),
		Buckets: await runQuery(event, BucketsQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(BucketOrderField, BucketOrderField.NAME, event.url),
				direction: urlToOrderDirection(event.url)
			},
			...readCursorPagination(event.url, rows),
			from: format(startOfMonth(subMonths(new Date(), 12)), 'yyyy-MM-dd'),
			to: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
		})
	};
}
