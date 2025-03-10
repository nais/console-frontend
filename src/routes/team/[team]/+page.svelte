<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import Deploys from '$lib/components/TeamDeployments.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import { numberToWords } from '$lib/utils/formatters';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);

	const deprecatedImages = $derived(
		$TeamOverview.data?.team.workloads.nodes.filter((workload) =>
			workload.status.errors.some(
				(error) => error.__typename === 'WorkloadStatusDeprecatedRegistry'
			)
		)
	);
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

{#if deprecatedImages?.length}
	<Alert variant="error">
		Starting from April 1st, applications and jobs on Nais must use images from Google Artifact
		Registry (GAR). The easiest way to ensure that images are stored in GAR is to use Nais' GitHub
		Actions in the workflow. <a
			href="https://nais.io/log/#2025-02-24-image-policy"
			target="_blank"
			rel="noopener noreferrer">Read more in Nais announcement</a
		>.
		<p>
			{teamSlug} currently has {numberToWords(deprecatedImages.length)}
			workload{deprecatedImages.length === 1 ? '' : 's'} using
			{deprecatedImages.length === 1
				? 'a deprecated image registry'
				: 'deprecated image registries'}.
		</p>

		{#if deprecatedImages.length < 5}
			{#each deprecatedImages as workload (workload.id)}
				<WorkloadLink {workload} />
			{/each}
		{:else}
			<details>
				<summary>Workloads with deprecated image registries</summary>
				{#each deprecatedImages as workload (workload.id)}
					<WorkloadLink {workload} />
				{/each}
			</details>
		{/if}
	</Alert>
{/if}
<div class="grid">
	<Card rows={1} columns={3}>
		<TeamInfo {teamSlug} {viewerIsMember} />
	</Card>

	<Card rows={1} columns={3}>
		<VulnerabilitySummary {teamSlug} />
	</Card>

	<Card rows={1} columns={3}>
		<TeamUtilizationAndOverage {teamSlug} />
	</Card>
	<Card rows={1} columns={3}>
		<AggregatedCostForTeam {teamSlug} />
	</Card>
	<div class="deployments">
		<Heading level="4" size="small" spacing>Last team deployments</Heading>
		{#if $TeamOverview.data}
			<Deploys team={$TeamOverview.data.team} />
		{/if}
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}
	.deployments {
		grid-column: span 12;
		grid-row: span 1;
	}
</style>
