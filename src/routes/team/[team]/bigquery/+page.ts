import { BigQueryDatasetOrderField, load_BigQuery, type BigQueryDatasetFilter } from '$houdini';
import { parseLabelsParam } from '$lib/domain/labels/labels';
import { urlToOrderDirection, urlToOrderField } from '$lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '$lib/utils/pageMeta';

const rows = 25;

export async function load(event) {
	const after = event.url.searchParams.get('after') || '';
	const before = event.url.searchParams.get('before') || '';
	const envParam = event.url.searchParams.get('environments')?.split(',').filter(Boolean);
	const environments = envParam?.length ? envParam : undefined;
	const labels = parseLabelsParam(event.url.searchParams.get('labels'));

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
				filter: { environments, labels } as BigQueryDatasetFilter,
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
