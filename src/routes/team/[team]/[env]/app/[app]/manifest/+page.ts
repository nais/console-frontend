import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { AppManifestQuery } from './appManifest';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			title: 'Manifest'
		})),
		AppManifest: await runQuery(event, AppManifestQuery, {
			team: event.params.team,
			env: event.params.env,
			app: event.params.app
		})
	};
}
