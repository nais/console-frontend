<script lang="ts">
	import { page } from '$app/state';
	import { AlertState } from '$houdini';
	import TeamOverviewActivityLog from '$lib/components/activity/team-overview/TeamOverviewActivityLog.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import PrometheusAlert from '$lib/components/errors/PrometheusAlert.svelte';
	import CriticalIssues from '$lib/components/issues/CriticalIssues.svelte';
	import IssueSummary from '$lib/components/issues/IssueSummary.svelte';
	import VulnerabilitySummary from '$lib/components/vulnerability/VulnerabilitySummary.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Alert } from '@nais/ds-svelte-community';
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
	{#if $TeamOverview.data?.team.firingAlerts.pageInfo.totalCount}
		<div class="alerts-wrapper">
			<PrometheusAlert
				{teamSlug}
				alerts={$TeamOverview.data?.team.firingAlerts.nodes}
				collapsible={false}
				alertsState={AlertState.FIRING}
			/>
		</div>
	{/if}
	{#if $TeamOverview.data?.team.pendingAlerts.pageInfo.totalCount}
		<div class="alerts-wrapper">
			<PrometheusAlert
				{teamSlug}
				alerts={$TeamOverview.data?.team.pendingAlerts.nodes}
				collapsible={false}
				alertsState={AlertState.PENDING}
			/>
		</div>
	{/if}

	<div class="summary-cards">
		<VulnerabilitySummary {teamSlug} />
	</div>

	<div class="criticals-row">
		<IssueSummary
			critical={$TeamOverview.data?.team.criticals.pageInfo.totalCount}
			warning={$TeamOverview.data?.team.warnings.pageInfo.totalCount}
			todo={$TeamOverview.data?.team.todos.pageInfo.totalCount}
			{teamSlug}
			loading={$TeamOverview.fetching}
		/>
		<CriticalIssues {teamSlug} />
	</div>

	<div class="detail-section">
		<AggregatedCostForTeam {teamSlug} />
		<TeamOverviewActivityLog {teamSlug} />
	</div>
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.summary-cards {
		display: grid;
		grid-template-columns: minmax(250px, max-content);
		gap: var(--spacing-layout);
	}

	.criticals-row {
		display: grid;
		grid-template-columns: minmax(250px, max-content) 1fr;
		gap: var(--spacing-layout);
		align-items: start;
	}

	@media (max-width: 768px) {
		.summary-cards,
		.criticals-row {
			grid-template-columns: 1fr;
		}
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
</style>
