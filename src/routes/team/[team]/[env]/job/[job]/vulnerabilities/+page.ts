import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { JobImageDetailsQuery } from './jobVulnerabilities';

const rows = 10;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Vulnerabilities' })),
		JobImageDetails: await runQuery(event, JobImageDetailsQuery, {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job,
			...readCursorPagination(event.url, rows)
		})
	};
}
