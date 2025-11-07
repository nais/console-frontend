import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/opensearch/[opensearch]/(single)') {
		return {};
	}
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.opensearch,
					href: '/team/[team]/[env]/opensearch/[opensearch]/(single)'
				}
			]
		}))
	};
}
