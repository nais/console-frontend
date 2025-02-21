import { RepositoryOrderField, type TeamRepositoryFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import type { RepositoriesVariables } from './$houdini';

const rows = 25;

export const _RepositoriesVariables: RepositoriesVariables = ({ url }) => {
	const filter = url.searchParams.get('filter');
	const after = url.searchParams.get('after') || '';
	const before = url.searchParams.get('before') || '';

	return {
		orderBy: {
			field: urlToOrderField(RepositoryOrderField, RepositoryOrderField.NAME, url),
			direction: urlToOrderDirection(url)
		},
		...(before ? { before, last: rows } : { after, first: rows }),
		filter: { name: filter } as TeamRepositoryFilter
	};
};
