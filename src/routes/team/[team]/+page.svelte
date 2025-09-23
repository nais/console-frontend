<script lang="ts">
	import { page } from '$app/state';
	import { AlertState } from '$houdini';
	import SidebarActivity from '$lib/components/activity/SidebarActivity.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import PrometheusAlert from '$lib/components/errors/PrometheusAlert.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import DeploymentListItem from '$lib/components/list/DeploymentListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import TeamUtilizationAndOverage from '$lib/components/TeamUtilizationAndOverage.svelte';
	import VulnerabilitySummary from '$lib/components/vulnerability/VulnerabilitySummary.svelte';
	import { docURL } from '$lib/doc';
	import { Alert, BodyLong, Heading, Loader } from '@nais/ds-svelte-community';
	import { CircleFillIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug } = $derived(data);
</script>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

<div class="wrapper">
	<div class="left">
		<div class="alerts-wrapper">
			{#if $TeamOverview.data?.team.firingAlerts.pageInfo.totalCount}
				<PrometheusAlert
					{teamSlug}
					alerts={$TeamOverview.data?.team.firingAlerts.nodes}
					collapsible={false}
					alertsState={AlertState.FIRING}
				/>
			{/if}
			{#if $TeamOverview.data?.team.pendingAlerts.pageInfo.totalCount}
				<PrometheusAlert
					{teamSlug}
					alerts={$TeamOverview.data?.team.pendingAlerts.nodes}
					collapsible={false}
					alertsState={AlertState.PENDING}
				/>
			{/if}
		</div>
		<div>
			<AggregatedCostForTeam {teamSlug} />
		</div>
		<div class="deployments">
			<Heading size="small" level="2"
				>Last {$TeamOverview.data?.team.deployments.nodes.length} Deployments for {teamSlug}</Heading
			>
			{#if $TeamOverview.data?.team.deployments.pageInfo.totalCount === 0}
				<BodyLong spacing>
					No deployments found. <ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				</BodyLong>
			{/if}
			{#if $TeamOverview.data}
				<List>
					{#each $TeamOverview.data.team.deployments.nodes as deployment (deployment.id)}
						<DeploymentListItem {deployment} showEnv />
					{/each}
				</List>
			{/if}
			<a href="/team/{teamSlug}/deploy" style:align-self="end">View All Deployments for Team</a>
		</div>
	</div>
	<div class="right">
		<div
			class="card issues {($TeamOverview.data?.team.critical.pageInfo.totalCount ?? 0) > 0
				? 'card-critical'
				: ($TeamOverview.data?.team.warnings.pageInfo.totalCount ?? 0) > 0
					? 'card-warning'
					: 'card-todo'}"
		>
			{#if $TeamOverview.fetching}
				<div
					style="display: flex; justify-content: center; align-items: center; margin-top: 100px;"
				>
					<Loader size="3xlarge" />
				</div>
			{:else}
				<Heading level="3" size="medium" spacing>Issue summary</Heading>
				<div class="summary critical">
					<CircleFillIcon />
					<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
						>{$TeamOverview.data?.team.critical.pageInfo.totalCount}
						critical issue{$TeamOverview.data?.team.critical.pageInfo.totalCount !== 1 ? 's' : ''} found</span
					>
				</div>
				<div class="summary warning">
					<CircleFillIcon />
					<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
						>{$TeamOverview.data?.team.warnings.pageInfo.totalCount}
						warning{$TeamOverview.data?.team.warnings.pageInfo.totalCount !== 1 ? 's' : ''} found</span
					>
				</div>

				<div class="summary todo">
					<CircleFillIcon />

					<span style="color: var(--ax-text-neutral); font-size: 1.2rem; font-weight: bold"
						>{$TeamOverview.data?.team.todos.pageInfo.totalCount}
						todo{$TeamOverview.data?.team.todos.pageInfo.totalCount !== 1 ? 's' : ''} found</span
					>
				</div>
			{/if}
			<a href="/team/{teamSlug}/issues" style:align-self="end">View All Issues for Team</a>
		</div>
		<div>
			<VulnerabilitySummary
				{teamSlug}
				workloads={$TeamOverview.data?.team.workloads}
				vulnerabilitySummary={$TeamOverview.data?.team.vulnerabilitySummary}
			/>
		</div>
		<div>
			<div class="card">
				<TeamUtilizationAndOverage {teamSlug} />
			</div>
		</div>
		<div style="display: flex; flex-direction: column; gap: var(--ax-space-8);">
			{#if $TeamOverview.data?.team}
				<SidebarActivity
					activityLog={$TeamOverview.data?.team}
					direct={$TeamOverview.data?.team.activityLog}
				/>
				<a href="/team/{teamSlug}/activity-log" style:align-self="end">View All Activity for Team</a
				>
			{/if}
		</div>
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}
	.left {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}
	.right {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
	}
	.deployments {
		align-self: start;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		grid-column: span 3;
		word-wrap: break-word;
		min-width: 100%;

		> a {
			align-self: end;
		}
	}

	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}

	.issues {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-24);
		padding-bottom: var(--ax-space-32);
	}

	.card-todo {
		border: 1px solid var(--ax-border-info-strong);
		background-color: var(--ax-bg-info-soft);
	}

	.card-warning {
		border: 1px solid var(--ax-border-warning);
		background-color: var(--ax-bg-warning-soft);
	}

	.card-critical {
		border: 1px solid var(--ax-border-danger);
		background-color: var(--ax-bg-danger-soft);
	}

	.summary {
		display: flex;
		align-items: center;
		gap: var(--ax-space-16);
	}

	.deployments {
		align-self: start;
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		word-wrap: break-word;

		> a {
			align-self: end;
		}
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}

	.todo {
		color: light-dark(var(--ax-bg-info-strong), var(--ax-bg-info-strong));
	}
	.warning {
		color: light-dark(var(--ax-bg-warning-moderate-pressed), var(--ax-bg-warning-strong-pressed));
	}
	.critical {
		color: light-dark(var(--ax-bg-danger-strong), var(--ax-bg-danger-strong));
	}
</style>
