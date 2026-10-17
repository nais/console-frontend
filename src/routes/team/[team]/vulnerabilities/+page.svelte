<script lang="ts">
	import { docURL } from '#lib/doc.js';
	import TeamCveSearch from '#lib/domain/vulnerability/TeamCveSearch.svelte';
	import TeamMeanTimeToFixHistoryGraph from '#lib/domain/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import TeamVulnerabilityHistoryGraph from '#lib/domain/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithVulnerabilities from '#lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyLong, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, TeamPriorityWorkloadsHigh, TeamSeverityWorkloads, teamSlug } =
		$derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	{const missingSbomCount = $derived(
		$TeamVulnerabilities.data.team.workloadsWithoutSbom.pageInfo.totalCount
	)}
	{const noSboms = $derived(
		missingSbomCount > 0 &&
			missingSbomCount === $TeamVulnerabilities.data.team.workloads.pageInfo.totalCount
	)}
	<div class="wrapper">
		{#if noSboms}
			<Alert variant="warning">
				No SBOMs found for this team. Vulnerability data is unavailable for all {missingSbomCount}
				{missingSbomCount === 1 ? 'workload' : 'workloads'}. Learn how to generate SBOMs in the
				<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
					>Nais documentation</ExternalLink
				>. Find your workloads under
				<a href="/team/{teamSlug}/applications">Applications</a>
				and <a href="/team/{teamSlug}/jobs">Jobs</a>.
			</Alert>
		{:else if missingSbomCount > 0}
			<Alert variant="warning">
				Vulnerability data is incomplete: {missingSbomCount}
				{missingSbomCount === 1 ? 'workload has' : 'workloads have'} no SBOM. The vulnerability counts
				do not cover these workloads. Learn how to generate SBOMs in the
				<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
					>Nais documentation</ExternalLink
				>.
			</Alert>
		{/if}

		{#if $TeamVulnerabilities.data.team.vulnerabilitySummary && !noSboms}
			{const urgentCount = $derived(
				$TeamVulnerabilities.data.team.urgentVulnerabilityIssues.pageInfo.totalCount
			)}
			{const exploitedWorkloadCount = $derived(
				$TeamVulnerabilities.data.team.exploitedWorkloads.pageInfo.totalCount
			)}
			<VulnerabilitySummary
				vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
				knownExploitedHref="?view=priority#priority-groups"
				{urgentCount}
				knownExploitedWorkloadCount={exploitedWorkloadCount}
			/>
		{/if}

		{#if !noSboms}
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
						high={TeamPriorityWorkloadsHigh}
						severity={TeamSeverityWorkloads}
						environmentNames={$TeamVulnerabilities.data.team.environments.map(
							(env) => env.environment.name
						)}
						highWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
							?.highWorkloadCount}
						elevatedWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
							?.elevatedWorkloadCount}
						monitorWorkloadCount={$TeamVulnerabilities.data.team.vulnerabilitySummary
							?.monitorWorkloadCount}
					/>
				{/key}
			</section>

			<section aria-label="Vulnerability History">
				<TeamVulnerabilityHistoryGraph {teamSlug} />
			</section>

			<section aria-label="Mean Time to Fix">
				<TeamMeanTimeToFixHistoryGraph {teamSlug} />
			</section>
		{/if}
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
