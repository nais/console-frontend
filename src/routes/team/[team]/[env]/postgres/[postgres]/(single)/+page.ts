import { load_PostgresOverview } from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: event.params.postgres,
			docPath: '/persistence/postgresql/explanations/postgres-cluster/'
		})),
		...(await load_PostgresOverview({
			event,
			blocking: true,
			variables: {
				team: event.params.team,
				env: event.params.env,
				name: event.params.postgres
			}
		}))
	};
}
