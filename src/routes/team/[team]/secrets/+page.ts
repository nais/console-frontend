import { load_Secrets, OrderDirection, SecretOrderField, type SecretFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';

export async function load(event) {
	const filter = event.url.searchParams.get('filter') || '';

	let filterVar: SecretFilter | undefined = undefined;

	if (filter === 'inUse' || filter === 'notInUse') {
		filterVar = { inUse: filter === 'inUse' ? true : false };
	}

	const after = event.url.searchParams.get('after') || '';

	return {
		...(await load_Secrets({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(SecretOrderField, SecretOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				after,
				filter: filterVar
			}
		}))
	};
}
