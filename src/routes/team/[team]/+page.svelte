<script lang="ts">
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import Deploys from '$lib/components/TeamDeployments.svelte';
	import TeamInfo from '$lib/components/TeamInfo.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/VulnerabilitySummary.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';

	import TeamErrorMessage from '$lib/components/TeamErrorMessage.svelte';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);

	const getWorkloadsWithError = (
		errorType:
			| 'WorkloadStatusNoRunningInstances'
			| 'WorkloadStatusInvalidNaisYaml'
			| 'WorkloadStatusSynchronizationFailing'
			| 'WorkloadStatusDeprecatedRegistry'
	) => {
		const workloads = $TeamOverview.data?.team.workloads.nodes.filter((workload) =>
			workload.status.errors.some((error) => error.__typename === errorType)
		);
		if (workloads?.length) {
			return {
				__typename: errorType,
				level: workloads[0].status.errors.find((error) => error.__typename === errorType)?.level,
				workloads
			};
		} else {
			return {
				__typename: errorType
			};
		}
	};
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}
<div class="alerts-wrapper">
	{#each (['WorkloadStatusNoRunningInstances', 'WorkloadStatusInvalidNaisYaml', 'WorkloadStatusSynchronizationFailing', 'WorkloadStatusDeprecatedRegistry'] as const).map(getWorkloadsWithError) as errors (errors.__typename)}
		{#if errors.workloads?.length && errors.level}
			<TeamErrorMessage
				error={{ __typename: errors.__typename, level: errors.level }}
				{teamSlug}
				workloads={errors.workloads}
			/>
		{/if}
	{/each}
</div>
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

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-4);
	}
	.deployments {
		grid-column: span 12;
		grid-row: span 1;
	}
</style>
