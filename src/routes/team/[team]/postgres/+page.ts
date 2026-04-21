import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, PostgresInstanceOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { PostgresInstancesQuery } from './postgres';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Postgres Instances' })),
		PostgresInstances: await runQuery(event, PostgresInstancesQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(
					PostgresInstanceOrderField,
					PostgresInstanceOrderField.NAME,
					event.url
				),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			},
			...readCursorPagination(event.url, rows)
		})
	};
}
