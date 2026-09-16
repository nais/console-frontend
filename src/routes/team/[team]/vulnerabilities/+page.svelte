<script lang="ts">
	import TeamCveSearch from '$lib/domain/vulnerability/TeamCveSearch.svelte';
	import TeamMeanTimeToFixHistoryGraph from '$lib/domain/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import TeamVulnerabilityHistoryGraph from '$lib/domain/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummaryMetrics from '$lib/domain/vulnerability/VulnerabilitySummaryMetrics.svelte';
	import WorkloadsWithVulnerabilities from '$lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { BodyLong, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, teamSlug } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	<div class="wrapper">
		{#if $TeamVulnerabilities.data.team.vulnerabilitySummary}
			<SurfaceCard title="Summary" level="h2" bordered>
				<VulnerabilitySummaryMetrics
					vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
				/>
			</SurfaceCard>
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

			<WorkloadsWithVulnerabilities team={teamSlug} />
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
