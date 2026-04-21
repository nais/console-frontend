import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { BucketQuery } from './bucket';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.bucket })),
		Bucket: await runQuery(event, BucketQuery, {
			team: event.params.team,
			environment: event.params.env,
			name: event.params.bucket
		})
	};
}
