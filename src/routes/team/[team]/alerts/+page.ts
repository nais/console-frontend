import {
	AlertOrderField,
	AlertState,
	load_Alerts,
	load_AlertsMetadata,
	OrderDirection,
	type AlertState$options
} from '$houdini';
import { TeamAlertsFilter } from '$houdini/graphql/inputs';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;

	const states: AlertState$options[] | undefined =
		(event.url.searchParams
			.get('states')
			?.split(',')
			.filter((s) => Object.values(AlertState).includes(s as AlertState$options)) as
			| AlertState$options[]
			| undefined) || undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Alerts',
			pageHeaderTitle: '',
			docPath: '/observability/alerting'
		})),
		...(await load_Alerts({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments, states } as TeamAlertsFilter,
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
