import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'BigQuery Datasets',
					href: '/team/[team]/bigquery'
				}
			]
		}))
	};
}
