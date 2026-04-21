import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { TeamOverviewQuery } from './teamOverview';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.team })),
		TeamOverview: await runQuery(event, TeamOverviewQuery, {
			team: event.params.team
		})
	};
}
