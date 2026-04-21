import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OpenSearchAccessOrderField, OrderDirection } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { redirect } from '@sveltejs/kit';
import { OpenSearchInstanceQuery } from './opensearch';

const rows = 10;

export async function load(event) {
	const OpenSearchInstance = await runQuery(event, OpenSearchInstanceQuery, {
		environment: event.params.env,
		team: event.params.team,
		name: event.params.opensearch,
		orderBy: {
			field: urlToOrderField(
				OpenSearchAccessOrderField,
				OpenSearchAccessOrderField.WORKLOAD,
				event.url
			),
			direction: urlToOrderDirection(event.url, OrderDirection.ASC)
		},
		...readCursorPagination(event.url, rows)
	});

	const name = OpenSearchInstance.data?.team.environment.openSearch.name;
	if (!!name && name !== event.params.opensearch) {
		redirect(307, `/team/${event.params.team}/${event.params.env}/opensearch/${name}`);
	}

	return {
		...(await addPageMeta(event, { title: event.params.opensearch })),
		OpenSearchInstance
	};
}
