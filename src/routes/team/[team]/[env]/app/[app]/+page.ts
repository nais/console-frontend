import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta.js';
import { AppQuery } from './app';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.app })),
		App: await runQuery(event, AppQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app
		})
	};
}
