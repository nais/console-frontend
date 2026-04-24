<script lang="ts">
	import TeamMeanTimeToFixHistoryGraph from '$lib/domain/vulnerability/TeamMeanTimeToFixHistoryGraph.svelte';
	import TeamVulnerabilityHistoryGraph from '$lib/domain/vulnerability/TeamVulnerabilityHistoryGraph.svelte';
	import VulnerabilitySummary from '$lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import WorkloadsWithVulnerabilities from '$lib/domain/vulnerability/WorkloadsWithVulnerabilities.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
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

		<div class="workloads-section">
			<div class="heading">
				<div class="content">
					<Heading as="h3" size="medium" spacing id="most_vulnerable_workloads"
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
		min-width: 0;
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
		min-width: 0;
	}

	.content {
		max-width: 80ch;
		min-width: 0;
	}

	.workloads-section {
		min-width: 0;
	}

	.columns {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: 1rem;
		align-items: start;
		margin-bottom: var(--ax-space-40);
		min-width: 0;
	}

	@media (max-width: 767px) {
		.columns {
			display: flex;
			flex-direction: column-reverse;
			margin-bottom: var(--ax-space-64);
		}
	}

	.graphs {
		display: grid;
		gap: var(--ax-space-32);
		min-width: 0;
	}

	@media (max-width: 767px) {
		.heading {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
