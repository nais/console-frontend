import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { PostgresInstanceQuery } from './postgres';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.postgres })),
		PostgresInstance: await runQuery(event, PostgresInstanceQuery, {
			env: event.params.env,
			team: event.params.team,
			name: event.params.postgres
		})
	};
}
