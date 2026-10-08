import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_TenantTeamPriorityGroups } from '$houdini';

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
	const none = pagination('none');

	return {
		...(await addPageMeta(event, {
			title: 'Team Security Posture'
		})),
		...(await load_TenantTeamPriorityGroups({
			event,
			blocking: true,
			variables: {
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
				monitorBefore: monitor.before,
				noneFirst: none.first,
				noneLast: none.last,
				noneAfter: none.after,
				noneBefore: none.before
			}
		}))
	};
}
