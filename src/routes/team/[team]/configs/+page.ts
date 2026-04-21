import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { ConfigOrderField, OrderDirection, type ConfigFilter } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { ConfigsQuery } from './configs';

const rows = 25;

export async function load(event) {
	const filter = event.url.searchParams.get('filter') || '';
	const nameFilter = event.url.searchParams.get('nameFilter') || '';

	let filterVar: ConfigFilter | undefined = undefined;

	if (filter === 'inUse' || filter === 'notInUse') {
		filterVar = { inUse: filter === 'inUse' ? true : false };
	}

	if (nameFilter) {
		filterVar = { ...filterVar, name: nameFilter };
	}

	return {
		...(await addPageMeta(event, { title: 'Config' })),
		Configs: await runQuery(event, ConfigsQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(ConfigOrderField, ConfigOrderField.NAME, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			},
			...readCursorPagination(event.url, rows),
			filter: filterVar
		})
	};
}
