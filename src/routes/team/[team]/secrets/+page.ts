import { load_Secrets, OrderDirection, SecretOrderField, type SecretFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

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

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Secrets' })),
		...(await load_Secrets({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(SecretOrderField, SecretOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows }),
				filter: filterVar
			}
		}))
	};
}
