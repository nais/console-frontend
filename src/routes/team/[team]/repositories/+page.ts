import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { RepositoryOrderField } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { RepositoriesQuery } from './repositories';

const rows = 25;

export async function load(event) {
	const filter = event.url.searchParams.get('filter') ?? '';

	return {
		...(await addPageMeta(event, { title: 'Repositories' })),
		Repositories: await runQuery(event, RepositoriesQuery, {
			team: event.params.team,
			orderBy: {
				field: urlToOrderField(RepositoryOrderField, RepositoryOrderField.NAME, event.url),
				direction: urlToOrderDirection(event.url)
			},
			...readCursorPagination(event.url, rows),
			filter: { name: filter }
		})
	};
}
