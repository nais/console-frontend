<script lang="ts">
	import { page } from '$app/state';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	import AppErrorTypeToMessage from '$lib/AppErrorTypeToMessage.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

<div class="wrapper">
	<!--div class="workloads-grid">
		{#if $TeamOverview.data?.team.workloads.edges}
			{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
				{#if workload.node.status.errors.length > 0}
					<div class="workload-card">
						<WorkloadLink hideTeam workload={workload.node} />
						{#each workload.node.status.errors as error, i (workload.node.id + error.__typename + i)}
							<AppErrorTypeToMessage {error} />
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</div-->
	<div class="todos">
		<Heading level="4" size="small" spacing>Todos</Heading>
		{#if $TeamOverview.data?.team.workloads.edges}
			{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
				{#if workload.node.status.errors.length > 0}
					<div>
						{#each workload.node.status.errors as error, i (workload.node.id + error.__typename + i)}
							<AppErrorTypeToMessage {error} />
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</div>
	<!--List>
		{#if $TeamOverview.data?.team.workloads.edges}
			{#each $TeamOverview.data.team.workloads.edges as workload (workload.node.id)}
				{#if workload.node.__typename === 'Application'}
					<AppListItem app={workload.node} />
				{:else}
					<JobListItem job={workload.node} />
				{/if}
			{/each}
		{/if}
	</List-->
	<div class="sidebar">
		<TeamInfo {teamSlug} {viewerIsMember} />
		<VulnerabilitySummary {teamSlug} />
		<TeamUtilizationAndOverage {teamSlug} />
		<AggregatedCostForTeam {teamSlug} />
	</div>
</div>

<!--div class="grid">
	<Card rows={1} columns={3}>

	</Card>

	<Card rows={1} columns={3}>

	</Card>

	<Card rows={1} columns={3}>

	</Card>
	<Card rows={1} columns={3}>

	</Card>

	<div class="deployments">
		<Heading level="4" size="small" spacing>Last team deployments</Heading>
		{#if $TeamOverview.data}
			<Deploys team={$TeamOverview.data.team} />
		{/if}
	</div>
</div-->

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.workloads-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.workload-card {
		background-color: var(--a-background-surface);
		border: 1px solid var(--a-gray-200);
		border-radius: var(--a-border-radius-1);
		padding: var(--a-spacing-2);
	}

	.sidebar {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	/*.grid {
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
	}*/
</style>
