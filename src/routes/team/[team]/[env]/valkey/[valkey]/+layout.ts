import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/valkey/[valkey]/(single)') {
		return {};
	}
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.valkey,
					href: '/team/[team]/[env]/valkey/[valkey]/(single)'
				}
			]
		}))
	};
}
