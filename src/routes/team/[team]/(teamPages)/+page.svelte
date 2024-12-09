<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import Deploys from '$lib/components/TeamDeployments.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import { Alert } from '@nais/ds-svelte-community';

	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ TeamOverview } = data);

	$: teamName = $page.params.team;
</script>

{#if $page.url.searchParams.has('deleted')}
	{@const msgParts = ($page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

<div class="grid">
	<Card rows={2} columns={3}>
		<TeamInfo {teamName} />
	</Card>

	<Card rows={2} columns={3}>
		<VulnerabilitySummary {teamName} />
	</Card>

	<Card rows={2} columns={3}>
		<TeamUtilizationAndOverage {teamName} />
	</Card>
	<Card rows={2} columns={3}>
		<AggregatedCostForTeam team={teamName} />
	</Card>

	<Card rows={1} columns={12}>
		{#if $TeamOverview.data}
			<Deploys team={$TeamOverview.data.team} />
		{/if}
	</Card>
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
</style>
