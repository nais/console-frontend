import { addPageMeta } from '$lib/utils/pageMeta.js';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/app/[app]') {
		return {
			...(await addPageMeta(event, {
				pageHeaderTitle: event.params.app
			}))
		};
	}
	return {
		...(await addPageMeta(event, {
			pageHeaderTitle: event.params.app,
			breadcrumbs: [
				{
					label: event.params.app,
					href: '/team/[team]/[env]/app/[app]'
				}
			]
		}))
	};
}
