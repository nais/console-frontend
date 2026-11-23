import { urlToOrderDirection, urlToOrderField } from '#lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_CveList } from '$houdini';
import { cveOrderFields, cvePagination, defaultCveOrder } from './pagination.js';

export async function load(event) {
	const orderBy = {
		field: urlToOrderField(cveOrderFields, defaultCveOrder.field, event.url),
		direction: urlToOrderDirection(event.url, defaultCveOrder.direction)
	};
	const cveOrder = `${orderBy.field}-${orderBy.direction}`;
	const meta = await addPageMeta(event, { title: 'CVE Database' });

	return {
		...meta,
		cveOrder,
		...(await load_CveList({
			event,
			blocking: true,
			variables: { orderBy, ...cvePagination(event.url, cveOrder) }
		}))
	};
}
