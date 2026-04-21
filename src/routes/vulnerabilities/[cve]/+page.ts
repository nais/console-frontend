import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { CVEDetailsQuery, CVEWorkloadsQuery } from './cve';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.cve })),
		CVEDetails: await runQuery(event, CVEDetailsQuery, {
			identifier: event.params.cve
		}),
		CVEWorkloads: await runQuery(event, CVEWorkloadsQuery, {
			identifier: event.params.cve,
			...readCursorPagination(event.url, rows)
		})
	};
}
