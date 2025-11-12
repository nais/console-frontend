import { AlertOrderField, load_Alerts, load_AlertsMetadata, OrderDirection } from '$houdini';
import type { TeamAlertsFilter } from '$houdini/runtime/generated';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments') === 'none'
			? undefined
			: event.url.searchParams.get('environments')?.split(',') || [];

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Alerts' })),
		...(await load_Alerts({
			event,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments } as TeamAlertsFilter,
				orderBy: {
					field: urlToOrderField(AlertOrderField, AlertOrderField.STATE, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		})),
		...(await load_AlertsMetadata({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
