<script lang="ts">
	import { page } from '$app/state';
	import { AlertState } from '$houdini';
	import TeamOverviewActivityLog from '$lib/components/activity/TeamOverviewActivityLog.svelte';
	import AggregatedCostForTeam from '$lib/components/AggregatedCostForTeam.svelte';
	import PrometheusAlert from '$lib/components/errors/PrometheusAlert.svelte';
	import HealthSummary from '$lib/components/issues/HealthSummary.svelte';
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
		<div style="display: flex; flex-direction: column; gap: var(--ax-space-8);">
			<TeamOverviewActivityLog {teamSlug} />
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
			<VulnerabilitySummary {teamSlug} />
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

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
	}
</style>
