import { JobOrderField, load_Jobs, type TeamJobsFilter } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/components/OrderByMenu.svelte';

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
		...(await load_Jobs({
			event,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments } as TeamJobsFilter,
				orderBy: {
					field: urlToOrderField(JobOrderField, JobOrderField.NAME, event.url),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
