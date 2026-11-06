import { addPageMeta } from '#lib/utils/pageMeta.js';
import { requireMainBranch } from '#lib/domain/postgres/branchCompatibility.js';

export async function load(event) {
	requireMainBranch(event.url);
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
