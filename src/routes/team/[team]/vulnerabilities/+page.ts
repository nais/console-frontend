import {
	load_TeamSeverityWorkloads,
	load_TeamNoSbomWorkloads,
	load_TeamVulnerabilities,
	OrderDirection,
	SBOMStatus,
	TeamNoSbomWorkloadsStore,
	TeamSeverityWorkloadsStore,
	VulnerabilitySummaryOrderByField,
	WorkloadOrderField
} from '$houdini';
import { addPageMeta } from '#lib/utils/pageMeta.js';
import { get } from 'svelte/store';
import { parseLabelsParam } from '#lib/domain/labels/labels.js';

export async function load(event) {
	const team = event.params.team;
	const environmentName = event.url.searchParams.get('environment') || null;
	const labels = parseLabelsParam(event.url.searchParams.get('labels')) ?? [];

	const teamVulnerabilities = await load_TeamVulnerabilities({
		event,
		variables: {
			team,
			environmentName,
			labels,
			unfiltered: !environmentName && labels.length === 0
		},
		blocking: true
	});
	const teamData = get(teamVulnerabilities.TeamVulnerabilities).data?.team;
	const missingSbomCount = teamData?.workloadsWithoutSbom.pageInfo.totalCount ?? 0;
	const workloadCount = teamData?.workloads.pageInfo.totalCount ?? 0;
	const noSboms = workloadCount > 0 && teamData?.teamVulnerabilitySummary?.sbomCount === 0;

	return {
		selection: { environmentName, labels },
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
		...(!noSboms
			? await load_TeamSeverityWorkloads({
					event,
					blocking: true,
					variables: {
						team,
						environmentName,
						labels,
						orderBy: {
							field: VulnerabilitySummaryOrderByField.VULNERABILITY_SEVERITY_CRITICAL,
							direction: OrderDirection.DESC
						}
					}
				})
			: { TeamSeverityWorkloads: new TeamSeverityWorkloadsStore() })
	};
}
