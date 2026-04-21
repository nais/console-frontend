import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { JobManifestQuery } from './jobManifest';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: 'Manifest' })),
		JobManifest: await runQuery(event, JobManifestQuery, {
			team: event.params.team,
			env: event.params.env,
			job: event.params.job
		})
	};
}
