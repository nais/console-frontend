import { urlToOrderDirection, urlToOrderField } from '#lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_CveList, load_V0sCveList } from '$houdini';
import { v0sCveListVariables } from '#lib/domain/vulnerability/v0sCve.js';
import { cveOrderFields, cvePagination, defaultCveOrder } from './pagination.js';
import type { PageLoad } from './$types';

export async function load(event: Parameters<PageLoad>[0]) {
	const { v0sVulnerabilities } = await event.parent();
	if (!v0sVulnerabilities) return _loadLegacy(event);

	return {
		v0s: true as const,
		...(await addPageMeta(event, { title: 'CVE Database' })),
		...(await load_V0sCveList({ event, blocking: true, variables: v0sCveListVariables(event.url) }))
	};
}

export async function _loadLegacy(event: Parameters<PageLoad>[0]) {
	const orderBy = {
		field: urlToOrderField(cveOrderFields, defaultCveOrder.field, event.url),
		direction: urlToOrderDirection(event.url, defaultCveOrder.direction)
	};
	const cveOrder = `${orderBy.field}-${orderBy.direction}`;
	const meta = await addPageMeta(event, { title: 'CVE Database' });

	return {
		v0s: false as const,
		...meta,
		cveOrder,
		...(await load_CveList({
			event,
			blocking: true,
			variables: { orderBy, ...cvePagination(event.url, cveOrder) }
		}))
	};
}
