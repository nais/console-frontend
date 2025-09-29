<script lang="ts">
	import { page } from '$app/state';
	import { AlertState } from '$houdini';
	import SidebarActivity from '$lib/components/activity/SidebarActivity.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import PrometheusAlert from '$lib/components/errors/PrometheusAlert.svelte';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import HealthSummary from '$lib/components/issues/HealthSummary.svelte';
	import DeploymentListItem from '$lib/components/list/DeploymentListItem.svelte';
	import List from '$lib/components/list/List.svelte';
	import VulnerabilitySummary from '$lib/components/vulnerability/VulnerabilitySummary.svelte';
	import { docURL } from '$lib/doc';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert, BodyLong } from '@nais/ds-svelte-community';
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

<GraphErrors errors={$TeamOverview.errors} />

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
		<!-- <div>
			<List
				title="Issue{($TeamOverview.data?.team.issues.nodes?.length ?? 0 > 1)
					? 's'
					: ''} {($TeamOverview.data?.team.issues?.pageInfo?.totalCount ?? 0) > 20
					? `(${$TeamOverview.data?.team.issues.nodes.length} of ${$TeamOverview.data?.team.issues?.pageInfo?.totalCount})`
					: ($TeamOverview.data?.team.issues?.pageInfo?.totalCount ?? 0) > 0
						? `(${$TeamOverview.data?.team.issues?.pageInfo?.totalCount})`
						: ''}"
			>
				{#each $TeamOverview.data?.team.issues?.nodes ?? [] as issue (issue.id)}
					<IssueListItem item={issue} />
				{/each}
			</List>
			<div style="display: flex; justify-content: flex-end; padding-top: var(--ax-space-8);">
				<a href="/team/{teamSlug}/issues">View All Issues</a>
			</div>
		</div> -->
		<div class="deployments">
			{#if $TeamOverview.data?.team.deployments.pageInfo.totalCount === 0}
				<BodyLong spacing>
					No deployments found. <ExternalLink href={docURL('/build/')}
						>Learn more about builds and deployments in Nais.</ExternalLink
					>
				</BodyLong>
			{/if}
			{#if $TeamOverview.data}
				<List title="Last {$TeamOverview.data?.team.deployments.nodes.length} Deployments">
					{#each $TeamOverview.data.team.deployments.nodes as deployment (deployment.id)}
						<DeploymentListItem {deployment} showEnv />
					{/each}
				</List>
			{/if}
			<a href="/team/{teamSlug}/deploy" style:align-self="end">View All Deployments</a>
		</div>
	</div>
	<div class="right">
		<HealthSummary
			critical={$TeamOverview.data?.team.criticals.pageInfo.totalCount}
			warning={$TeamOverview.data?.team.warnings.pageInfo.totalCount}
			todo={$TeamOverview.data?.team.todos.pageInfo.totalCount}
			{teamSlug}
			loading={$TeamOverview.fetching}
		/>
		<div>
			<VulnerabilitySummary
				{teamSlug}
				workloads={$TeamOverview.data?.team.workloads}
				vulnerabilitySummary={$TeamOverview.data?.team.vulnerabilitySummary}
			/>
		</div>
		<!-- <div>
			<div class="card">
				<TeamUtilizationAndOverage {teamSlug} />
			</div>
		</div> -->
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
</style>
