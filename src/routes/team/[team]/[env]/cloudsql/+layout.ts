import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'Cloud SQL Instances',
					href: '/team/[team]/cloudsql'
				}
			]
		}))
	};
}
