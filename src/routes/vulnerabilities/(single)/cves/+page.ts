import { urlToOrderDirection, urlToOrderField } from '#lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { CVEOrderField, load_CveList, load_CvePriorityGroups, OrderDirection } from '$houdini';
import { cvePagination } from './pagination.js';

export async function load(event) {
	const orderBy = {
		field: urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, event.url),
		direction: urlToOrderDirection(event.url, OrderDirection.ASC)
	};
	const cveOrder = `${orderBy.field}-${orderBy.direction}`;
	const grouped = orderBy.field === CVEOrderField.PRIORITY;
	const meta = await addPageMeta(event, { title: 'CVE Database' });
	if (!grouped) {
		return {
			...meta,
			cveOrder,
			grouped,
			CvePriorityGroups: null,
			...(await load_CveList({
				event,
				blocking: true,
				variables: { orderBy, ...cvePagination('all', event.url, cveOrder) }
			}))
		};
	}
	const high = cvePagination('high', event.url, cveOrder);
	const elevated = cvePagination('elevated', event.url, cveOrder);
	const monitor = cvePagination('monitor', event.url, cveOrder);

	return {
		...meta,
		cveOrder,
		grouped,
		CveList: null,
		...(await load_CvePriorityGroups({
			event,
			blocking: true,
			variables: {
				orderBy,
				highFirst: high.first,
				highLast: high.last,
				highAfter: high.after,
				highBefore: high.before,
				elevatedFirst: elevated.first,
				elevatedLast: elevated.last,
				elevatedAfter: elevated.after,
				elevatedBefore: elevated.before,
				monitorFirst: monitor.first,
				monitorLast: monitor.last,
				monitorAfter: monitor.after,
				monitorBefore: monitor.before
			}
		}))
	};
}
