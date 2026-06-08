import {
	load_PostgresInstances,
	OrderDirection,
	PostgresInstanceOrderField,
	PostgresInstanceState,
	type PostgresInstanceFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;
	const validStates = new Set<string>(Object.values(PostgresInstanceState));
	const states =
		event.url.searchParams
			.get('states')
			?.split(',')
			.filter((s) => validStates.has(s)) || undefined;
	const majorVersions: string[] | undefined =
		event.url.searchParams.get('majorVersions')?.split(',').filter(Boolean) || undefined;
	const highAvailabilityParam = event.url.searchParams.get('highAvailability');
	const highAvailability =
		highAvailabilityParam === 'true' ? true : highAvailabilityParam === 'false' ? false : undefined;

	return {
		...(await addPageMeta(event, {
			title: 'Postgres Instances',
			pageHeaderTitle: '',
			docPath: '/persistence/postgresql'
		})),
		...(await load_PostgresInstances({
			event,
			variables: {
				team: event.params.team,
				filter: { environments, states, majorVersions, highAvailability } as PostgresInstanceFilter,
				orderBy: {
					field: urlToOrderField(
						PostgresInstanceOrderField,
						PostgresInstanceOrderField.NAME,
						event.url
					),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
