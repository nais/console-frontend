import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'Postgres Instances',
					href: '/team/[team]/postgres'
				}
			]
		}))
	};
}
