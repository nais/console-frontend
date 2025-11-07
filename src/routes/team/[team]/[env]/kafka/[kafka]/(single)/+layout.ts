import { addPageMeta } from '$lib/utils/pageMeta';

export async function load(event) {
	if (event.route.id === '/team/[team]/[env]/kafka/[kafka]/(single)') {
		return {};
	}
	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.kafka,
					href: '/team/[team]/[env]/kafka/[kafka]/(single)'
				}
			]
		}))
	};
}
