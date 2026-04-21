import { runQuery } from '$lib/urql/load';
import { addPageMeta } from '$lib/utils/pageMeta';
import { BigQueryDatasetQuery } from './bigquery';

export async function load(event) {
	return {
		...(await addPageMeta(event, { title: event.params.bigquery })),
		BigQueryDataset: await runQuery(event, BigQueryDatasetQuery, {
			team: event.params.team,
			environment: event.params.env,
			name: event.params.bigquery
		})
	};
}
