<script lang="ts">
	import TeamCveSearch from '#lib/domain/vulnerability/TeamCveSearch.svelte';
	import TeamMeanTimeToFixHistoryGraph from '#lib/domain/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import TeamVulnerabilityHistoryGraph from '#lib/domain/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithVulnerabilities from '#lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { BodyLong, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, teamSlug } = $derived(data);

	const noVulnerabilitiesWorkloadCount = (
		summary:
			| {
					sbomCount: number;
					highWorkloadCount: number;
					elevatedWorkloadCount: number;
					monitorWorkloadCount: number;
			  }
			| null
			| undefined
	) =>
		summary
			? Math.max(
					0,
					summary.sbomCount -
						summary.highWorkloadCount -
						summary.elevatedWorkloadCount -
						summary.monitorWorkloadCount
				)
			: undefined;
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	<div class="wrapper">
		{#if $TeamVulnerabilities.data.team.vulnerabilitySummary}
			{const urgentCount = $derived(
				$TeamVulnerabilities.data.team.urgentVulnerabilityIssues.pageInfo.totalCount
			)}
			{const exploitedWorkloadCount = $derived(
				$TeamVulnerabilities.data.team.exploitedWorkloads.pageInfo.totalCount
			)}
			<VulnerabilitySummary
				vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
				knownExploitedHref="#priority-groups"
				{urgentCount}
				knownExploitedWorkloadCount={exploitedWorkloadCount}
			/>
		{/if}

		<section aria-labelledby="workload-vulnerabilities">
			<Heading as="h2" size="medium" spacing id="workload-vulnerabilities"
				>Workload Vulnerabilities</Heading
			>

			<div class="cve-search-section">
				<Heading as="h3" size="small" id="cve-search">Search for vulnerability</Heading>
				<BodyLong size="small"
					>Find details and suppress a CVE across your team's workloads.</BodyLong
				>
				<TeamCveSearch team={teamSlug} />
			</div>

			{#key teamSlug}
				<WorkloadsWithVulnerabilities
					team={teamSlug}
					environmentNames={$TeamVulnerabilities.data.team.environments.map(
						(env) => env.environment.name
					)}
					highWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary?.highWorkloadCount}
					elevatedWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
						?.elevatedWorkloadCount}
					monitorWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
						?.monitorWorkloadCount}
					noVulnerabilitiesWorkloadCount={noVulnerabilitiesWorkloadCount(
						$TeamVulnerabilities.data.team.vulnerabilitySummary
					)}
				/>
			{/key}
		</section>

		<section aria-label="Vulnerability History">
			<TeamVulnerabilityHistoryGraph {teamSlug} />
		</section>

		<section aria-label="Mean Time to Fix">
			<TeamMeanTimeToFixHistoryGraph {teamSlug} />
		</section>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--ax-space-32);
		min-width: 0;
	}

	.cve-search-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding-bottom: var(--spacing-layout);
	}
</style>
