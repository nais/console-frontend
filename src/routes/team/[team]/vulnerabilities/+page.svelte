<script lang="ts">
	import { docURL } from '#lib/doc.js';
	import TeamCveSearch from '#lib/domain/vulnerability/TeamCveSearch.svelte';
	import TeamV0sWorkloads from '#lib/domain/vulnerability/TeamV0sWorkloads.svelte';
	import VulnerabilitySummary from '#lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithoutSbom from '#lib/domain/vulnerability/WorkloadsWithoutSbom.svelte';
	import WorkloadsWithVulnerabilities from '#lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import ExternalLink from '#lib/ui/ExternalLink.svelte';
	import { mergeWorkloadLabelFacets } from '#lib/domain/vulnerability/workloadLabels.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { Alert, BodyLong, Heading } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let {
		TeamV0sOverview,
		orderBy,
		TeamVulnerabilities,
		TeamNoSbomWorkloads,
		TeamSeverityWorkloads,
		teamSlug,
		selection
	} = $derived(data);
	const labelFacets = $derived(
		mergeWorkloadLabelFacets(
			$TeamVulnerabilities?.data?.team.applications.facets?.labels ?? [],
			$TeamVulnerabilities?.data?.team.jobs.facets?.labels ?? []
		)
	);
</script>

{#if TeamV0sOverview && orderBy}
	<TeamV0sWorkloads store={TeamV0sOverview} {selection} {orderBy} team={teamSlug} />
{:else}
	<GraphErrors errors={$TeamVulnerabilities?.errors} />

	{#if $TeamVulnerabilities?.data}
		{const missingSbomCount = $derived(
			$TeamVulnerabilities.data.team.workloadsWithoutSbom.pageInfo.totalCount
		)}
		{const workloadCount = $derived($TeamVulnerabilities.data.team.workloads.pageInfo.totalCount)}
		{const noSboms = $derived(
			workloadCount > 0 && $TeamVulnerabilities.data.team.teamVulnerabilitySummary?.sbomCount === 0
		)}
		<div class="wrapper">
			{#if noSboms}
				<Alert variant="warning">
					No usable SBOMs are available for this team, so vulnerability data is unavailable for
					{workloadCount}
					{workloadCount === 1 ? 'workload' : 'workloads'}.
					{#if missingSbomCount > 0 && missingSbomCount < workloadCount}
						{missingSbomCount} {missingSbomCount === 1 ? 'workload has' : 'workloads have'} no SBOM.
					{/if}
					Learn how to generate SBOMs in the
					<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
						>Nais documentation</ExternalLink
					>.
				</Alert>
			{:else if missingSbomCount > 0}
				<Alert variant="warning">
					Vulnerability data is incomplete for this team: {missingSbomCount}
					{missingSbomCount === 1 ? 'workload has' : 'workloads have'} no SBOM. The vulnerability counts
					do not cover these workloads. Learn how to generate SBOMs in the
					<ExternalLink href={docURL('/services/vulnerabilities/how-to/sbom/')}
						>Nais documentation</ExternalLink
					>.
				</Alert>
			{/if}

			{#if TeamNoSbomWorkloads && (noSboms || missingSbomCount > 0)}
				{#key JSON.stringify([teamSlug, noSboms, noSboms ? workloadCount : missingSbomCount])}
					<WorkloadsWithoutSbom
						count={noSboms ? workloadCount : missingSbomCount}
						allWithoutUsableSbom={noSboms}
						workloadsWithoutSbom={TeamNoSbomWorkloads}
					/>
				{/key}
			{/if}

			{#if $TeamVulnerabilities.data.team.vulnerabilitySummary && !noSboms}
				{const exploitedWorkloadCount = $derived(
					$TeamVulnerabilities.data.team.exploitedWorkloads.pageInfo.totalCount
				)}
				<VulnerabilitySummary
					vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
					knownExploitedHref="#workload-list"
					knownExploitedWorkloadCount={exploitedWorkloadCount}
				/>
			{/if}

			{#if !noSboms && TeamSeverityWorkloads}
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
							severity={TeamSeverityWorkloads}
							{selection}
							{labelFacets}
							environmentNames={$TeamVulnerabilities.data.team.environments.map(
								(env) => env.environment.name
							)}
						/>
					{/key}
				</section>
			{/if}
		</div>
	{/if}
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--nais-space-32);
		min-width: 0;
	}

	.cve-search-section {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-8);
		padding: var(--nais-space-16) var(--nais-space-20);
		margin-bottom: var(--nais-space-20);
		border-radius: var(--radius-lg);
		border: var(--sh-border-width) solid var(--border);
		background-color: var(--card);
	}
</style>
