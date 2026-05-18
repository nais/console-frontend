import { BigQueryDatasetOrderField, load_BigQuery } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';

	return {
		...(await addPageMeta(event, {
			title: 'BigQuery Datasets',
			pageHeaderTitle: '',
			docPath: '/persistence/bigquery'
		})),
		...(await load_BigQuery({
			event,
			variables: {
				team: event.params.team,
				orderBy: {
					field: urlToOrderField(
						BigQueryDatasetOrderField,
						BigQueryDatasetOrderField.NAME,
						event.url
					),
					direction: urlToOrderDirection(event.url)
				},
				...(before ? { before, last: rows } : { after, first: rows })
			}
		}))
	};
}
