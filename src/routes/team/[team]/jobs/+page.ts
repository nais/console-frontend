import {
	JobOrderField,
	JobState,
	load_Jobs,
	load_JobsListMetadata,
	OrderDirection,
	type JobState$options,
	type TeamJobsFilter
} from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

const stateMap: Record<string, JobState$options> = {
	running: JobState.RUNNING,
	completed: JobState.COMPLETED,
	failed: JobState.FAILED,
	unknown: JobState.UNKNOWN
};

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments') === 'none'
			? undefined
			: event.url.searchParams.get('environments')?.split(',') || [];

	const statesParam = event.url.searchParams.get('states');
	const states: JobState$options[] | undefined = statesParam
		? statesParam
				.split(',')
				.map((s) => stateMap[s])
				.filter(Boolean)
		: undefined;

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, { title: 'Jobs', pageHeaderTitle: '' })),
		...(await load_Jobs({
			event,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments, states } as TeamJobsFilter,
				orderBy: {
					field: urlToOrderField(JobOrderField, JobOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		})),
		...(await load_JobsListMetadata({
			event,
			variables: {
				team: event.params.team
			}
		}))
	};
}
