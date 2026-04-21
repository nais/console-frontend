import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { JobQuery } from './job';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.job })),
		Job: await runQuery(event, JobQuery, {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job
		})
	};
}
