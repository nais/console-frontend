import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta';
import { DeploymentsQuery } from './deployments';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Deployments' })),
		Deployments: await runQuery(event, DeploymentsQuery, {
			team: event.params.team,
			...readCursorPagination(event.url, rows)
		})
	};
}
