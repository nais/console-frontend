import {
	load_PostgresInstances,
	OrderDirection,
	PostgresInstanceOrderField,
	PostgresInstanceState
} from '$houdini';
import type { PostgresInstanceFilter } from '$houdini/graphql/inputs';
import { parseLabelsParam } from '$lib/domain/labels/labels';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const envParam = event.url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const validStates = new Set<string>(Object.values(PostgresInstanceState));
	const statesParam = event.url.searchParams
		.get('states')
		?.split(',')
		.filter((s) => validStates.has(s));
	const states = statesParam?.length ? statesParam : undefined;
	const majorVersionsParam = event.url.searchParams
		.get('majorVersions')
		?.split(',')
		.filter(Boolean);
	const majorVersions = majorVersionsParam?.length ? majorVersionsParam : undefined;
	const highAvailabilityParam = event.url.searchParams.get('highAvailability');
	const highAvailability =
		highAvailabilityParam === 'true' ? true : highAvailabilityParam === 'false' ? false : undefined;
	const labels = parseLabelsParam(event.url.searchParams.get('labels'));

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
				filter: {
					environments,
					states,
					majorVersions,
					highAvailability,
					labels
				} as PostgresInstanceFilter,
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
