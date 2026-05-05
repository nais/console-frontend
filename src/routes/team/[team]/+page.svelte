<script lang="ts">
	import { page } from '$app/state';
	import TeamOverviewActivityLog from '$lib/domain/activity/team-overview/TeamOverviewActivityLog.svelte';
	import CriticalIssues from '$lib/domain/issues/CriticalIssues.svelte';
	import TeamInventory from '$lib/domain/team/TeamInventory.svelte';
	import TeamSummary from '$lib/domain/team/TeamSummary.svelte';
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

<div class="wrapper">
	<div class="main-content">
		<TeamSummary
			{teamSlug}
			criticalIssues={$TeamOverview.data?.team.criticals.pageInfo.totalCount ?? 0}
			firingAlerts={$TeamOverview.data?.team.firingAlerts.pageInfo.totalCount ?? 0}
			loading={$TeamOverview.fetching}
		/>
		<TeamInventory {teamSlug} />
		<CriticalIssues {teamSlug} />
	</div>
	<div class="summary-cards">
		<TeamOverviewActivityLog {teamSlug} />
	</div>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.summary-cards {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--spacing-layout);
		align-self: start;
	}

	.team-info {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
		margin-top: calc(-1 * var(--spacing-layout));
		margin-bottom: var(--spacing-layout);
	}

	@media (max-width: 767px) {
		.team-info {
			grid-template-columns: 1fr;
		}
	}
</style>
