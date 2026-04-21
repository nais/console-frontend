import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { ConfigQuery } from './config';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.config })),
		Config: await runQuery(event, ConfigQuery, {
			team: event.params.team,
			env: event.params.env,
			config: event.params.config
		})
	};
}
