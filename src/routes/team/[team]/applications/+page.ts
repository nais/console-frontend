import {
	ApplicationOrderField,
	ApplicationState,
	load_Applications,
	load_ApplicationsListMetadata,
	OrderDirection,
	type ApplicationState$options,
	type TeamApplicationsFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

const stateMap: Record<string, ApplicationState$options> = {
	running: ApplicationState.RUNNING,
	'not-running': ApplicationState.NOT_RUNNING,
	unknown: ApplicationState.UNKNOWN
};

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',') || undefined;

	const statesParam = event.url.searchParams.get('states');
	const states: ApplicationState$options[] | undefined = statesParam
		? statesParam
				.split(',')
				.map((s) => stateMap[s])
				.filter(Boolean)
		: undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Applications',
			pageHeaderTitle: '',
			docPath: '/workloads/application'
		})),
		...(await load_Applications({
			event,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments, states } as TeamApplicationsFilter,
				orderBy: {
					field: urlToOrderField(ApplicationOrderField, ApplicationOrderField.ISSUES, event.url),
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
