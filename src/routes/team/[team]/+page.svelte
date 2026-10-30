<script lang="ts">
	import { page } from '$app/state';
	import TeamActivityCard from '#lib/domain/activity/TeamActivityCard.svelte';
	import CriticalIssues from '#lib/domain/issues/CriticalIssues.svelte';
	import TeamInventory from '#lib/domain/team/TeamInventory.svelte';
	import TeamSummary from '#lib/domain/team/TeamSummary.svelte';
	import { ShAlert } from '#lib/shadcn/ui/index.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { TeamHealth, TeamOverview, TeamSummaryVulnerabilities, TeamSummaryCost, teamSlug, purpose } =
		$derived(data);
</script>

{#if purpose}
	<p class="team-purpose-text">{purpose}</p>
{/if}

{#if page.url.searchParams.has('deleted')}
	{const msgParts = $derived((page.url.searchParams.get('deleted') || '').split('/'))}
	<div style="margin-bottom: var(--spacing-layout)">
		<ShAlert variant="success" size="sm">
			Successfully deleted {msgParts[0]}
			{msgParts[1]}.
		</ShAlert>
	</div>
{/if}

<GraphErrors errors={$TeamOverview.errors} />

<div class="health-strip">
	<SectionBoundary message="Team summary failed to render.">
		<TeamSummary
			{teamSlug}
			criticalIssues={$TeamOverview.data?.team.criticalIssues.pageInfo.totalCount ?? 0}
			warningIssues={$TeamOverview.data?.team.warningIssues.pageInfo.totalCount ?? 0}
			todoIssues={$TeamOverview.data?.team.todoIssues.pageInfo.totalCount ?? 0}
			firingAlerts={$TeamOverview.data?.team.firingAlerts.pageInfo.totalCount ?? 0}
			loading={$TeamOverview.fetching}
			vulnerabilityData={$TeamSummaryVulnerabilities.data}
			costData={$TeamSummaryCost.data}
			costLoading={$TeamSummaryCost.fetching}
		/>
	</SectionBoundary>
</div>

<div
	class="overview-bento"
	class:no-critical-issues={!$TeamHealth.fetching &&
		($TeamHealth.data?.team?.issues?.pageInfo?.totalCount ?? 0) === 0}
>
	{#if $TeamHealth.fetching || ($TeamHealth.data?.team?.issues?.pageInfo?.totalCount ?? 0) > 0}
		<div class="bento-main">
			<CriticalIssues {teamSlug} store={TeamHealth} />
		</div>
	{/if}
	<div class="bento-side">
		<TeamInventory {teamSlug} />
		<SectionBoundary message="Latest activity failed to render.">
			<TeamActivityCard
				{teamSlug}
				viewAllHref="/team/{teamSlug}/activity-log"
				title="Latest activity"
			/>
		</SectionBoundary>
	</div>
</div>

<style>
	.team-purpose-text {
		margin: 0 0 1.25rem 0;
		font-size: 0.875rem;
		color: var(--muted-foreground);
		max-width: 68ch;
		line-height: 1.5;
	}

	.health-strip {
		margin-bottom: 1.25rem;
	}

	.overview-bento {
		display: grid;
		grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
		gap: 1.25rem;
		align-items: start;
	}

	.overview-bento.no-critical-issues {
		grid-template-columns: 1fr;
	}

	.overview-bento.no-critical-issues .bento-side {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
		align-items: start;
	}

	.bento-main,
	.bento-side {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		min-width: 0;
	}

	@media (max-width: 1024px) {
		.overview-bento {
			grid-template-columns: 1fr;
		}
	}
</style>
