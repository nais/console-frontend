import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { SecretQuery } from './secret';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.secret })),
		Secret: await runQuery(event, SecretQuery, {
			team: event.params.team,
			env: event.params.env,
			secret: event.params.secret
		})
	};
}
