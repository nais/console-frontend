import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { AlertOrderField, OrderDirection, type TeamAlertsFilter } from '$lib/urql/gql/graphql';
import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { AlertsMetadataQuery, AlertsQuery } from './alerts';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments') === 'none'
			? undefined
			: event.url.searchParams.get('environments')?.split(',') || [];

	return {
		...(await addPageMeta(event, { title: 'Alerts' })),
		Alerts: await runQuery(event, AlertsQuery, {
			team: event.params.team,
			filter: { name: filter, environments } as TeamAlertsFilter,
			orderBy: {
				field: urlToOrderField(AlertOrderField, AlertOrderField.STATE, event.url),
				direction: urlToOrderDirection(event.url, OrderDirection.ASC)
			},
			...readCursorPagination(event.url, rows)
		}),
		AlertsMetadata: await runQuery(event, AlertsMetadataQuery, {
			team: event.params.team
		})
	};
}
