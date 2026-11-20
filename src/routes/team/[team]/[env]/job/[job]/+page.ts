import { load_Job, load_JobDeployment, load_JobWorkloadEvents } from '$houdini';
import { recentWorkloadEventCount } from '#lib/domain/workload/workloadEventPagination.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const rows = 6;

export async function load(event) {
	const { legacyDeployDisabled } = await event.parent();
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const { team, env, job } = event.params;
	const variables = { team, env, job };
	const [overview, deployment, events] = await Promise.all([
		load_Job({
			event,
			variables: {
				...variables,
				legacyDeployDisabled,
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}),
		load_JobDeployment({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_JobWorkloadEvents({ event, variables: { ...variables, first: recentWorkloadEventCount } })
	]);

	return {
		...(await addPageMeta(event, { title: job })),
		...overview,
		...deployment,
		...events
	};
}
