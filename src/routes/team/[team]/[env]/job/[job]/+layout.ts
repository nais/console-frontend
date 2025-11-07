import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/job/[job]') {
		return {};
	}
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.job,
					href: '/team/[team]/[env]/job/[job]'
				}
			]
		}))
	};
}
