import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { OrderDirection, SecretOrderField, type SecretFilter } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { SecretsQuery } from './secrets';

const rows = 25;

export async function load(event) {
	const filter = event.url.searchParams.get('filter') || '';
	const nameFilter = event.url.searchParams.get('nameFilter') || '';

	let filterVar: SecretFilter | undefined = undefined;

	if (filter === 'inUse' || filter === 'notInUse') {
		filterVar = { inUse: filter === 'inUse' ? true : false };
	}

	if (nameFilter) {
		filterVar = { ...filterVar, name: nameFilter };
	}

	return {
		...(await addPageMeta(event, { title: 'Secrets' })),
		Secrets: await runQuery(event, SecretsQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(SecretOrderField, SecretOrderField.NAME, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			},
			...readCursorPagination(event.url, rows),
			filter: filterVar
		})
	};
}
