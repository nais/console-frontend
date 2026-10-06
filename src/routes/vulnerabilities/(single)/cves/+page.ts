import { CVEOrderField, load_CvePriorityGroups, OrderDirection } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '#lib/ui/OrderByMenu.svelte';
import { addPageMeta } from '#lib/utils/pageMeta.js';

const rows = 20;

export async function load(event) {
	function pagination(group: string) {
		const before = event.url.searchParams.get(`${group}Before`) || null;
		const after = event.url.searchParams.get(`${group}After`) || null;
		return {
			first: before ? null : rows,
			last: before ? rows : null,
			after: before ? null : after,
			before
		};
	}
	const high = pagination('high');
	const elevated = pagination('elevated');
	const monitor = pagination('monitor');

	return {
		...(await addPageMeta(event, {
			title: 'CVE Database'
		})),
		...(await load_CvePriorityGroups({
			event,
			blocking: true,
			variables: {
				orderBy: {
					field: urlToOrderField(CVEOrderField, CVEOrderField.PRIORITY, event.url),
					direction: urlToOrderDirection(event.url, OrderDirection.ASC)
				},
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
