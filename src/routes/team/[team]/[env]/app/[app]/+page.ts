import {
	load_App,
	load_AppDeployment,
	load_AppInstanceGroups,
	load_AppWorkloadEvents,
	load_WorkloadHealthV0s
} from '$houdini';
import { recentWorkloadEventCount } from '#lib/domain/workload/workloadEventPagination.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	const { legacyDeployDisabled, v0sVulnerabilities } = await event.parent();
	const { team, env, app } = event.params;
	const variables = { team, env, app };
	const [overview, instanceGroups, deployment, events, health] = await Promise.all([
		load_App({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_AppInstanceGroups({ event, variables }),
		load_AppDeployment({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_AppWorkloadEvents({ event, variables: { ...variables, first: recentWorkloadEventCount } }),
		v0sVulnerabilities
			? load_WorkloadHealthV0s({ event, variables: { team, env, workload: app } })
			: { WorkloadHealthV0s: undefined }
	]);

	return {
		...(await addPageMeta(event, { title: app })),
		...overview,
		...instanceGroups,
		...deployment,
		...health,
		...events
	};
}
