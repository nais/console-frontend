<script lang="ts">
	import TeamMeanTimeToFixHistoryGraph from '$lib/components/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import TeamVulnerabilityHistoryGraph from '$lib/components/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummary from '$lib/components/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithVulnerabilities from '$lib/components/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { BodyLong, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamVulnerabilities, teamSlug } = $derived(data);
</script>

<GraphErrors errors={$TeamVulnerabilities.errors} />

{#if $TeamVulnerabilities.data}
	<div class="wrapper">
		<div class="columns">
			<div class="graphs">
				<TeamVulnerabilityHistoryGraph {teamSlug} />
				<TeamMeanTimeToFixHistoryGraph {teamSlug} />
			</div>
			<VulnerabilitySummary {teamSlug} />
		</div>

		<div>
			<div class="heading">
				<div class="content">
					<Heading level="3" size="medium" spacing id="most_vulnerable_workloads"
						>Most Vulnerable Workloads</Heading
					>
					<BodyLong spacing>
						This team's workloads ranked by security risk using Risk Score (default sorting). Focus
						remediation efforts where they'll have the greatest impact.
					</BodyLong>
				</div>
			</div>

			<WorkloadsWithVulnerabilities team={teamSlug} />
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		gap: var(--ax-space-32);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}

	.columns {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 1rem;
		align-items: start;
	}

	.graphs {
		display: grid;
		gap: var(--ax-space-32);
	}
</style>
