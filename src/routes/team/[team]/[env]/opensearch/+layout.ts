import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'OpenSearch Instances',
					href: '/team/[team]/opensearch'
				}
			]
		}))
	};
}
