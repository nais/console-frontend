import {
	load_TeamPriorityWorkloadsHigh,
	load_TeamSeverityWorkloads,
	load_TeamVulnerabilities,
	OrderDirection,
	TeamPriorityWorkloadsHighStore,
	TeamSeverityWorkloadsStore,
	VulnerabilitySummaryOrderByField
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';

export async function load(event) {
	const team = event.params.team;
	// Only the initial view is loaded here; the toggle fetches the other one on demand.
	const view = event.untrack(() =>
		event.url.searchParams.get('view') === 'priority' ? 'priority' : 'severity'
	);

	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities',
			docPath: '/services/vulnerabilities'
		})),
		...(await load_TeamVulnerabilities({
			event,
			variables: { team }
		})),
		...(view === 'priority'
			? await load_TeamPriorityWorkloadsHigh({
					event,
					variables: {
						team,
						orderBy: {
							field: VulnerabilitySummaryOrderByField.VULNERABILITY_RISK_SCORE,
							direction: OrderDirection.DESC
						}
					}
				})
			: { TeamPriorityWorkloadsHigh: new TeamPriorityWorkloadsHighStore() }),
		...(view === 'severity'
			? await load_TeamSeverityWorkloads({
					event,
					variables: {
						team,
						orderBy: {
							field: VulnerabilitySummaryOrderByField.VULNERABILITY_SEVERITY_CRITICAL,
							direction: OrderDirection.DESC
						}
					}
				})
			: { TeamSeverityWorkloads: new TeamSeverityWorkloadsStore() })
	};
}
