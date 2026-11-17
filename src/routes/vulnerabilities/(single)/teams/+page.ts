import { addPageMeta } from '#lib/utils/pageMeta.js';
import { load_TenantTeamPriorityGroups, OrderDirection, TeamOrderField } from '$houdini';
import { urlToOrderDirection, urlToOrderField } from '#lib/ui/OrderByMenu.svelte';

const rows = 20;

export async function load(event) {
	const onlyMyTeams = event.url.searchParams.get('myTeams') === 'true';
	const orderBy = {
		field: urlToOrderField(
			{
				RISK_SCORE: TeamOrderField.RISK_SCORE,
				SBOM_COVERAGE: TeamOrderField.SBOM_COVERAGE,
				WORKLOAD_COUNT: TeamOrderField.WORKLOAD_COUNT,
				SLUG: TeamOrderField.SLUG
			},
			TeamOrderField.SBOM_COVERAGE,
			event.url
		),
		direction: urlToOrderDirection(event.url, OrderDirection.ASC)
	};
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
		onlyMyTeams,
		...(await addPageMeta(event, {
			title: 'Team Security Posture'
		})),
		...(await load_TenantTeamPriorityGroups({
			event,
			blocking: true,
			variables: {
				orderBy,
				teamScope: onlyMyTeams ? { memberOfViewer: true } : null,
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
