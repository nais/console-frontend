<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import AggregatedTeamCost from '$lib/components/AggregatedTeamCost.svelte';
	import Deploys from '$lib/components/Deploys.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import { Alert } from '@nais/ds-svelte-community';

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
	<!--Card rows={1} columns={2}>
		<TeamStatus {teamName} />
		TODO: TeamStatus
	</Card-->

	<Card rows={2} columns={3}>
		<VulnerabilitySummary {teamName} />
	</Card>

	<Card rows={2} columns={3}>
		<TeamUtilizationAndOverage {teamName} />
	</Card>
	<Card rows={1} columns={3}>
		<AggregatedTeamCost team={teamName} />
	</Card>

	<Card rows={1} columns={12}>
		<h4>Deployments</h4>

		<Deploys {teamName} />
	</Card>

	<!--ActivityLog {teamName} columns={12} /-->
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
