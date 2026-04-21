import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { RunsWithPodNamesQuery } from './jobLogs';

export const ssr = false;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Logs' })),
		RunsWithPodNames: await runQuery(event, RunsWithPodNamesQuery, {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job
		})
	};
}
