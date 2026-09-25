<script lang="ts">
	import { page } from '$app/state';
	import TeamCveSearch from '$lib/domain/vulnerability/TeamCveSearch.svelte';
	import TeamMeanTimeToFixHistoryGraph from '$lib/domain/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import TeamVulnerabilityHistoryGraph from '$lib/domain/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import KnownExploitedWorkloads from '$lib/domain/vulnerability/KnownExploitedWorkloads.svelte';
	import PrototypeSwitcher from '$lib/domain/vulnerability/prototype/PrototypeSwitcher.svelte';
	import VulnerabilitySummaryVariantC from '$lib/domain/vulnerability/prototype/VulnerabilitySummaryVariantC.svelte';
	import VulnerabilitySummaryMetrics from '$lib/domain/vulnerability/VulnerabilitySummaryMetrics.svelte';
	import WorkloadsWithVulnerabilities from '$lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { BodyLong, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, teamSlug } = $derived(data);

	const variants = ['A', 'C'] as const;
	let variant = $derived(
		(variants as readonly string[]).includes(page.url.searchParams.get('variant') ?? '')
			? (page.url.searchParams.get('variant') as (typeof variants)[number])
			: 'A'
	);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	<div class="wrapper">
		{#if $TeamVulnerabilities.data.team.vulnerabilitySummary}
			{@const urgentCount =
				$TeamVulnerabilities.data.team.urgentVulnerabilityIssues.pageInfo.totalCount}
			{@const exploitedWorkloadCount =
				$TeamVulnerabilities.data.team.exploitedWorkloads.pageInfo.totalCount}
			{#if variant === 'C'}
				<VulnerabilitySummaryVariantC
					vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
					knownExploitedHref="#known-exploited-list"
					{urgentCount}
					knownExploitedWorkloadCount={exploitedWorkloadCount}
				/>
			{:else}
				<VulnerabilitySummaryMetrics
					vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
					knownExploitedHref="#known-exploited-list"
					{urgentCount}
					knownExploitedWorkloadCount={exploitedWorkloadCount}
				/>
			{/if}
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
			/>
			{#key teamSlug}
				<KnownExploitedWorkloads team={teamSlug} />
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

{#if import.meta.env.DEV}
	<PrototypeSwitcher {variants} current={variant} />
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
