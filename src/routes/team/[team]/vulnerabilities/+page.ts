import {
	load_TeamPriorityWorkloadsHigh,
	load_TeamSeverityWorkloads,
	load_TeamNoSbomWorkloads,
	load_TeamVulnerabilities,
	OrderDirection,
	SBOMStatus,
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
	const view = event.untrack((): 'priority' | 'severity' =>
		event.url.searchParams.get('view') === 'priority' ? 'priority' : 'severity'
	);

	const teamVulnerabilities = await load_TeamVulnerabilities({
		event,
		variables: { team },
		blocking: true
	});
	const teamData = get(teamVulnerabilities.TeamVulnerabilities).data?.team;
	const missingSbomCount = teamData?.workloadsWithoutSbom.pageInfo.totalCount ?? 0;
	const workloadCount = teamData?.workloads.pageInfo.totalCount ?? 0;
	const noSboms = workloadCount > 0 && teamData?.vulnerabilitySummary?.sbomCount === 0;

	return {
		initialView: view,
		preloadedView: noSboms ? null : view,
		...(await addPageMeta(event, {
			title: 'Vulnerabilities',
			docPath: '/services/vulnerabilities'
		})),
		...teamVulnerabilities,
		...(noSboms || missingSbomCount > 0
			? await load_TeamNoSbomWorkloads({
					event,
					variables: {
						team,
						first: 20,
						last: null,
						after: null,
						before: null,
						sbomStatus: noSboms ? null : SBOMStatus.NO_SBOM,
						orderBy: { field: WorkloadOrderField.NAME, direction: OrderDirection.ASC }
					}
				})
			: { TeamNoSbomWorkloads: new TeamNoSbomWorkloadsStore() }),
		...(view === 'priority' && !noSboms
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
		...(view === 'severity' && !noSboms
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
