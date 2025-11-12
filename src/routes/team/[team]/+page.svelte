<script lang="ts">
	import { page } from '$app/state';
	import { AlertState } from '$houdini';
	import TeamOverviewActivityLog from '$lib/domain/activity/team-overview/TeamOverviewActivityLog.svelte';
	import AggregatedCostForTeam from '$lib/domain/cost/AggregatedCostForTeam.svelte';
	import PrometheusAlert from '$lib/domain/monitoring/PrometheusAlert.svelte';
	import CriticalIssues from '$lib/domain/issues/CriticalIssues.svelte';
	import IssueSummary from '$lib/domain/issues/IssueSummary.svelte';
	import VulnerabilitySummary from '$lib/domain/vulnerability/VulnerabilitySummary.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Alert, BodyShort } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamOverview, teamSlug, purpose } = $derived(data);
</script>

<div class="team-info">
	<div>
		<BodyShort>{purpose}</BodyShort>
	</div>
</div>

{#if page.url.searchParams.has('deleted')}
	{@const msgParts = (page.url.searchParams.get('deleted') || '').split('/')}
	<Alert variant="success" size="small">
		Successfully deleted {msgParts[0]}
		{msgParts[1]}.
	</Alert>
{/if}

<GraphErrors errors={$TeamOverview.errors} />

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

<div class="wrapper">
	<div class="main-content">
		<CriticalIssues {teamSlug} />
		<div>
			<AggregatedCostForTeam {teamSlug} />
		</div>
	</div>
	<div class="summary-cards">
		<IssueSummary
			critical={$TeamOverview.data?.team.criticals.pageInfo.totalCount}
			warning={$TeamOverview.data?.team.warnings.pageInfo.totalCount}
			todo={$TeamOverview.data?.team.todos.pageInfo.totalCount}
			{teamSlug}
			loading={$TeamOverview.fetching}
		/>
		<VulnerabilitySummary {teamSlug} />
		<TeamOverviewActivityLog {teamSlug} />
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.summary-cards {
		display: grid;
		grid-template-columns: minmax(250px, max-content);
		gap: var(--spacing-layout);
	}

	.alerts-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-8);
		padding-bottom: var(--spacing-layout);
	}

	.team-info {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
		margin-top: calc(-1 * var(--spacing-layout));
		margin-bottom: var(--spacing-layout);
	}
</style>
