import { load_JobWorkloadEvents } from '$houdini';
import { workloadEventPageVariables } from '#lib/domain/workload/workloadEventPagination.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Recent events' })),
		...(await load_JobWorkloadEvents({
			event,
			variables: { ...event.params, ...workloadEventPageVariables(event.url.searchParams) }
		}))
	};
}
