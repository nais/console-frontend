import { load_Secrets, OrderDirection, SecretOrderField, type SecretFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';

const rows = 25;
export async function load(event) {
	const filter = event.url.searchParams.get('filter') || '';

	let filterVar: SecretFilter | undefined = undefined;

	if (filter === 'inUse' || filter === 'notInUse') {
		filterVar = { inUse: filter === 'inUse' ? true : false };
	}

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
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
