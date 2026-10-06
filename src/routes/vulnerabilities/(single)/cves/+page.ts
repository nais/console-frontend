import { urlToOrderDirection, urlToOrderField } from '#lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { CVEOrderField, load_CvePriorityGroups, OrderDirection } from '$houdini';
import { cvePagination } from './pagination.js';

export async function load(event) {
	const orderBy = {
		field: urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, event.url),
		direction: urlToOrderDirection(event.url, OrderDirection.ASC)
	};
	const cveOrder = `${orderBy.field}-${orderBy.direction}`;
	const high = cvePagination('high', event.url, cveOrder);
	const elevated = cvePagination('elevated', event.url, cveOrder);
	const monitor = cvePagination('monitor', event.url, cveOrder);

	return {
		cveOrder,
		...(await addPageMeta(event, {
			title: 'CVE Database'
		})),
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
