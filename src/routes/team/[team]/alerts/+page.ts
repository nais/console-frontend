import { AlertOrderField, load_Alerts, OrderDirection } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';

// const rows = 25;

export async function load(event) {
	// const filter: string = event.url.searchParams.get('filter') || '';
	// const environments: string[] | undefined =
	// 	event.url.searchParams.get('environments') === 'none'
	// 		? undefined
	// 		: event.url.searchParams.get('environments')?.split(',') || [];

	// const after = event.url.searchParams.get('after') || '';
	// const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_Alerts({
			event,
			variables: {
				team: event.params.team,
				// filter: { name: filter, environments } as TeamApplicationsFilter,
				orderBy: {
					field: urlToOrderField(AlertOrderField, AlertOrderField.STATE, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				}
				// ...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
