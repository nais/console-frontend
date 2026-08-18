import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'Valkey Instances',
					href: '/team/[team]/valkey'
				}
			]
		}))
	};
}
