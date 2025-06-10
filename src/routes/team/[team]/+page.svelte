<script lang="ts">
	import { page } from '$app/state';
	import ActivityLogItem from '$lib/components/ActivityLogItem.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import { supportedErrorTypes } from '$lib/components/errors/ErrorMessage.svelte';
	import TeamErrorMessage from '$lib/components/errors/TeamErrorMessage.svelte';
	import DeploymentItemShort from '$lib/components/list/DeploymentShortListItem.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummaryFinal from '$lib/components/VulnerabilitySummaryFinal.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug, viewerIsMember } = $derived(data);

	const getWorkloadsWithError = (errorType: (typeof supportedErrorTypes)[number]) => {
		const workloads = $TeamOverview.data?.team.statuses.nodes.filter((workload) =>
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

<div class="wrapper">
	<div class="alerts-wrapper">
		{#each supportedErrorTypes.map(getWorkloadsWithError) as errors (errors.__typename)}
			{#if errors.workloads?.length && errors.level}
				<TeamErrorMessage
					collapsible={errors.__typename !== 'WorkloadStatusNoRunningInstances'}
					error={{
						__typename: errors.__typename,
						level: errors.level
					}}
					{teamSlug}
					workloads={errors.workloads}
				/>
			{/if}
		{/each}
	</div>
	<div class="grid">
		{#if $TeamOverview.data}
			<div>
				<VulnerabilitySummaryFinal
					workloads={$TeamOverview.data.team.workloads}
					vulnerabilitySummary={$TeamOverview.data.team.vulnerabilitySummary}
				/>
			</div>
		{/if}
		<div class="card">
			<TeamUtilizationAndOverage {teamSlug} />
		</div>
		<div class="card" style:grid-column="span 2"><AggregatedCostForTeam {teamSlug} /></div>
		<div class="card deployments">
			<Heading size="small" level="2">Deployments</Heading>
			{#if $TeamOverview.data}
				<div class="raised">
					{#each $TeamOverview.data.team.deployments.nodes as deployment (deployment.id)}
						<div><DeploymentItemShort {deployment} /></div>
					{/each}
				</div>
			{/if}
			<a href="/team/{teamSlug}/deploy" style:align-self="end" style:margin-top="auto"
				>View Deployments</a
			>
		</div>
		<div class="card activity">
			<Heading size="small" level="2">Activity</Heading>
			{#if $TeamOverview.data}
				<div class="raised">
					{#each $TeamOverview.data.team.activityLog.nodes as item (item.id)}
						<div><ActivityLogItem {item} /></div>
					{/each}
				</div>
			{/if}
			{#if viewerIsMember}
				<a href="/team/{teamSlug}/activity-log" style:align-self="end" style:margin-top="auto"
					>View Activity Log</a
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.raised {
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;

		> div {
			background-color: var(--ax-bg-default);
			padding: var(--ax-space-8) var(--ax-space-20);
		}

		> div:first-child {
			border-top-left-radius: 8px;
			border-top-right-radius: 8px;
			padding-top: var(--ax-space-12);
		}

		> div:last-child {
			padding-bottom: var(--ax-space-12);
			border-bottom-left-radius: 8px;
			border-bottom-right-radius: 8px;
		}
	}

	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}

	.activity {
		grid-column: span 2;
		word-wrap: break-word;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		min-height: 100%;

		> a {
			align-self: end;
		}
	}

	.deployments {
		grid-column: span 2;
		word-wrap: break-word;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		min-height: 100%;
		align-self: start;

		> a {
			align-self: end;
		}
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		grid-auto-flow: dense;
	}
	.grid:not(:first-child) {
		margin-top: 1rem;
	}
	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
</style>
