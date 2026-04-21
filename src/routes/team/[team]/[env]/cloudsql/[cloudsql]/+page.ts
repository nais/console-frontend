import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { SqlInstanceQuery } from './cloudsql';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.cloudsql })),
		SqlInstance: await runQuery(event, SqlInstanceQuery, {
			env: event.params.env,
			team: event.params.team,
			name: event.params.cloudsql
		})
	};
}
