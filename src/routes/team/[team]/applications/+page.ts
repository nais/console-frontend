import {
	ApplicationOrderField,
	load_Applications,
	load_ApplicationsListMetadata,
	OrderDirection,
	type TeamApplicationsFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',') || undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await load_Applications({
			event,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments } as TeamApplicationsFilter,
				orderBy: {
					field: urlToOrderField(ApplicationOrderField, ApplicationOrderField.STATUS, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		})),
		...(await load_ApplicationsListMetadata({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
