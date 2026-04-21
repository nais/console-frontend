import { runQuery } from '$lib/urql/load';
import { readCursorPagination } from '$lib/urql/pagination';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { AppDeploysQuery } from './appDeploys';

const rows = 25;

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Deployments' })),
		AppDeploys: await runQuery(event, AppDeploysQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app,
			...readCursorPagination(event.url, rows)
		})
	};
}
