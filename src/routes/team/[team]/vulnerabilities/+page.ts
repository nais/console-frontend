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
import { readWorkloadLabelSelection } from '#lib/domain/vulnerability/workloadLabels.js';

export async function load(event) {
	const team = event.params.team;
	const view: 'priority' | 'severity' =
		event.url.searchParams.get('view') === 'priority' ? 'priority' : 'severity';
	const environmentName = event.url.searchParams.get('environment') || null;
	const { labels, labelKey, labelDirection } = readWorkloadLabelSelection(event.url.searchParams);
	const direction = labelDirection === 'DESC' ? OrderDirection.DESC : OrderDirection.ASC;

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
		selection: { environmentName, labels, labelKey, labelDirection, view },
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
						orderBy: { field: WorkloadOrderField.NAME, direction: OrderDirection.ASC },
						environments: environmentName ? [environmentName] : null,
						labels
					}
				})
			: { TeamNoSbomWorkloads: new TeamNoSbomWorkloadsStore() }),
		...(view === 'priority' && !noSboms
			? await load_TeamPriorityWorkloadsHigh({
					event,
					blocking: true,
					variables: {
						team,
						environmentName,
						labels,
						orderBy: {
							field: labelKey
								? VulnerabilitySummaryOrderByField.LABEL
								: VulnerabilitySummaryOrderByField.VULNERABILITY_RISK_SCORE,
							direction: labelKey ? direction : OrderDirection.DESC,
							...(labelKey ? { labelKey } : {})
						}
					}
				})
			: { TeamPriorityWorkloadsHigh: new TeamPriorityWorkloadsHighStore() }),
		...(view === 'severity' && !noSboms
			? await load_TeamSeverityWorkloads({
					event,
					blocking: true,
					variables: {
						team,
						environmentName,
						labels,
						orderBy: {
							field: labelKey
								? VulnerabilitySummaryOrderByField.LABEL
								: VulnerabilitySummaryOrderByField.VULNERABILITY_SEVERITY_CRITICAL,
							direction: labelKey ? direction : OrderDirection.DESC,
							...(labelKey ? { labelKey } : {})
						}
					}
				})
			: { TeamSeverityWorkloads: new TeamSeverityWorkloadsStore() })
	};
}
