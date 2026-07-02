import { JobOrderField, load_Jobs, OrderDirection, type TeamJobsFilter } from '$houdini';
import { parseLabelsParam } from '$lib/domain/labels/labels';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const filter: string = event.url.searchParams.get('filter') || '';
	const environments: string[] | undefined =
		event.url.searchParams.get('environments')?.split(',').filter(Boolean) || undefined;

	const states: string[] | undefined =
		event.url.searchParams.get('states')?.split(',').filter(Boolean) || undefined;

	const labels = parseLabelsParam(event.url.searchParams.get('labels'));

	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'Jobs',
			pageHeaderTitle: '',
			docPath: '/workloads/job'
		})),
		...(await load_Jobs({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				filter: { name: filter, environments, states, labels } as TeamJobsFilter,
				orderBy: {
					field: urlToOrderField(JobOrderField, JobOrderField.ISSUES, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.DESC)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
