import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'Jobs',
					href: '/team/[team]/jobs'
				}
			]
		}))
	};
}
