import { load_Repositories, RepositoryOrderField } from '$houdini';
import type { TeamRepositoryFilter } from '$houdini/graphql/inputs';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Repositories',
			pageHeaderTitle: '',
			docPath: '/build/how-to/build-and-deploy/#authorize-your-github-repository-for-deployment'
		})),
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
