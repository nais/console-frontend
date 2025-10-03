<script lang="ts">
	import { page } from '$app/state';
	import { AlertState } from '$houdini';
	import TeamOverviewActivityLog from '$lib/components/activity_team/TeamOverviewActivityLog.svelte';
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

		<div style="display: flex; flex-direction: column; gap: var(--ax-space-8);">
			<HealthSummary {teamSlug} />
			<TeamOverviewActivityLog {teamSlug} />
		</div>
	</div>
	<div class="right">
		<div>
			<VulnerabilitySummary {teamSlug} />
		</div>
		<div>
			<AggregatedCostForTeam {teamSlug} />
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
	}
	.right {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding-bottom: var(--spacing-layout);
	}
</style>
