import { load_Repositories, RepositoryOrderField, type TeamRepositoryFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const filter = event.url.searchParams.get('filter');
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Repositories' })),
		...(await load_Repositories({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(RepositoryOrderField, RepositoryOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				filter: { name: filter } as TeamRepositoryFilter
			}
		}))
	};
}
