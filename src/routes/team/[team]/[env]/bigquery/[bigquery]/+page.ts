import { load_BigQueryDataset } from '$houdini';
import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.bigquery })),
		...(await load_BigQueryDataset({
			event,
			variables: {
				team: event.params.team,
				environment: event.params.env,
				name: event.params.bigquery
			}
		}))
	};
}
