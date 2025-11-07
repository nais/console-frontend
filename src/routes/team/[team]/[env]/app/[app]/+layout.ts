import { addPageMeta } from '$lib/utils/pageMeta.js';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/app/[app]') {
		return {};
	}
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.app,
					href: '/team/[team]/[env]/app/[app]'
				}
			]
		}))
	};
}
