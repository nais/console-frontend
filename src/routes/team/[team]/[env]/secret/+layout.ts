import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: 'Secrets',
					href: '/team/[team]/secrets'
				}
			]
		}))
	};
}
