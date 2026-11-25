import {
	load_Job,
	load_JobDeployment,
	load_JobRunsList,
	load_JobWorkloadEvents,
	load_WorkloadHealthV0s
} from '$houdini';
import { recentWorkloadEventCount } from '#lib/domain/workload/workloadEventPagination.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	const { legacyDeployDisabled, v0sVulnerabilities } = await event.parent();
	const { team, env, job } = event.params;
	const variables = { team, env, job };
	const [overview, deployment, events, runs, health] = await Promise.all([
		load_Job({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_JobDeployment({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_JobWorkloadEvents({ event, variables: { ...variables, first: recentWorkloadEventCount } }),
		load_JobRunsList({ event, variables }),
		v0sVulnerabilities
			? load_WorkloadHealthV0s({ event, variables: { team, env, workload: job } })
			: { WorkloadHealthV0s: undefined }
	]);

	return {
		...(await addPageMeta(event, { title: job })),
		...overview,
		...deployment,
		...events,
		...health,
		...runs
	};
}
