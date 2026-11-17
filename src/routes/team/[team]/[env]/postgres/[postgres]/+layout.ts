import { addPageMeta } from '#lib/utils/pageMeta.js';
import { rejectRetiredBranchLinks } from '#lib/domain/postgres/legacyLinks.js';

export async function load(event) {
	rejectRetiredBranchLinks(event.url);
	if (event.route.id === '/team/[team]/[env]/postgres/[postgres]/(single)') {
		return {};
	}

	return {
		...(await addPageMeta(event, {
			breadcrumbs: [
				{
					label: event.params.postgres,
					href: '/team/[team]/[env]/postgres/[postgres]/(single)'
				}
			]
		}))
	};
}
