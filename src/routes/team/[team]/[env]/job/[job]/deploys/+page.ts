import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { JobDeploysQuery } from './jobDeploys';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Deployments' })),
		JobDeploys: await runQuery(event, JobDeploysQuery, {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job,
			...readCursorPagination(event.url, rows)
		})
	};
}
