import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/postgres/[postgres]') {
		return {};
	}

	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.postgres,
					href: '/team/[team]/[env]/postgres/[postgres]'
				}
			]
		}))
	};
}
