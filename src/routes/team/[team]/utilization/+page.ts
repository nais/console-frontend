import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TeamResourceUsageQuery } from './teamResourceUsage';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Utilization' })),
		TeamResourceUsage: await runQuery(event, TeamResourceUsageQuery, {
			team: event.params.team
		})
	};
}
