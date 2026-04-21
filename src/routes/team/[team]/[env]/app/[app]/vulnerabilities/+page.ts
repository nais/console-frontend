import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { ApplicationImageDetailsQuery } from './appVulnerabilities';

const rows = 10;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Vulnerabilities' })),
		ApplicationImageDetails: await runQuery(event, ApplicationImageDetailsQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app,
			...readCursorPagination(event.url, rows)
		})
	};
}
