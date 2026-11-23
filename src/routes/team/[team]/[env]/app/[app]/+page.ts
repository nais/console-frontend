import {
	load_App,
	load_AppDeployment,
	load_AppInstanceGroups,
	load_AppWorkloadEvents
} from '$houdini';
import { recentWorkloadEventCount } from '#lib/domain/workload/workloadEventPagination.js';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	const { legacyDeployDisabled } = await event.parent();
	const { team, env, app } = event.params;
	const variables = { team, env, app };
	const [overview, instanceGroups, deployment, events] = await Promise.all([
		load_App({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_AppInstanceGroups({ event, variables }),
		load_AppDeployment({ event, variables: { ...variables, legacyDeployDisabled } }),
		load_AppWorkloadEvents({ event, variables: { ...variables, first: recentWorkloadEventCount } })
	]);

	return {
		...(await addPageMeta(event, { title: app })),
		...overview,
		...instanceGroups,
		...deployment,
		...events
	};
}
