import { addPageMeta } from '#lib/utils/pageMeta.js';

export const ssr = false;

export async function load(event) {
	return addPageMeta(event, {
		title: 'Logs',
		pageHeaderTitle: event.params.postgres
	});
}
