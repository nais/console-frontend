import {
	load_TeamPriorityWorkloadsHigh,
	load_TeamSeverityWorkloads,
	load_TeamNoSbomWorkloads,
	load_TeamVulnerabilities,
	OrderDirection,
	TeamPriorityWorkloadsHighStore,
	TeamNoSbomWorkloadsStore,
	TeamSeverityWorkloadsStore,
	VulnerabilitySummaryOrderByField,
	WorkloadOrderField
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';

export async function load(event) {
	const team = event.params.team;
	// Only the initial view is loaded here; the toggle fetches the other one on demand.
	const view = event.untrack(() =>
		event.url.searchParams.get('view') === 'priority' ? 'priority' : 'severity'
	);

	const teamVulnerabilities = await load_TeamVulnerabilities({
		event,
		variables: { team },
		blocking: true
	});
	const missingSbomCount =
		get(teamVulnerabilities.TeamVulnerabilities).data?.team.workloadsWithoutSbom.pageInfo
			.totalCount ?? 0;

	return {
		...(await addPageMeta(event, {
			title: 'Vulnerabilities',
			docPath: '/services/vulnerabilities'
		})),
		...teamVulnerabilities,
		...(missingSbomCount > 0
			? await load_TeamNoSbomWorkloads({
					event,
					variables: {
						team,
						first: 20,
						after: null,
						orderBy: { field: WorkloadOrderField.NAME, direction: OrderDirection.ASC }
					}
				})
			: { TeamNoSbomWorkloads: new TeamNoSbomWorkloadsStore() }),
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
