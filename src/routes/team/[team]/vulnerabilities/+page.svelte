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
		<div class="cve-search-section">
			<Heading as="h2" size="xsmall">Search for vulnerability</Heading>
			<BodyLong size="small">Find details and suppress a CVE across your team's workloads.</BodyLong
			>
			<TeamCveSearch team={teamSlug} />
		</div>

		{#if $TeamVulnerabilities.data.team.vulnerabilitySummary}
			<SurfaceCard title="Summary" level="h2" bordered>
				<VulnerabilitySummaryMetrics
					vulnerabilitySummary={$TeamVulnerabilities.data.team.vulnerabilitySummary}
				/>
			</SurfaceCard>
		{/if}

		<div class="graphs">
			<TeamVulnerabilityHistoryGraph {teamSlug} />
			<TeamMeanTimeToFixHistoryGraph {teamSlug} />
		</div>

		<section aria-labelledby="most_vulnerable_workloads">
			<Heading as="h2" size="medium" spacing id="most_vulnerable_workloads"
				>Most Vulnerable Workloads</Heading
			>
			<BodyLong spacing>
				This team's workloads ranked by security risk using Risk Score (default sorting). Focus
				remediation efforts where they'll have the greatest impact.
			</BodyLong>

			<WorkloadsWithVulnerabilities team={teamSlug} />
		</section>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-32);
		min-width: 0;
	}

	.cve-search-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.graphs {
		display: grid;
		gap: var(--ax-space-32);
		min-width: 0;
	}
</style>
