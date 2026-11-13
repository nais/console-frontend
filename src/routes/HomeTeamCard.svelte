<script lang="ts">
	import type { HomeTeamSummaries$result, UserTeams$result } from '$houdini';
	import { ArrowRightIcon, PersonGroupIcon } from '#lib/icons/index.js';
	import { Badge, Heading } from '#lib/shadcn/ui/index.js';
	import { pluralize } from '#lib/utils/formatters.js';

	type Team = Extract<
		UserTeams$result['me'],
		{ __typename: 'User' }
	>['teams']['edges'][number]['node']['team'];

	let {
		team,
		summary
	}: {
		team: Team;
		summary?: HomeTeamSummaries$result['teams']['nodes'][number];
	} = $props();
</script>

<article class="team-card">
	<a href="/team/{team.slug}" class="team-card-main">
		<div class="team-heading">
			<span class="surface-icon"><PersonGroupIcon aria-hidden="true" /></span>
			<div class="team-title">
				<Heading as="h3" size="small">{team.slug}</Heading>
			</div>
			<ArrowRightIcon class="team-go-icon" aria-hidden="true" />
		</div>
		{#if team.purpose}
			<p class="team-purpose" title={team.purpose}>{team.purpose}</p>
		{/if}
	</a>
	<div class="team-links">
		<a href="/team/{team.slug}/applications">
			{summary
				? `${summary.inventoryCounts.applications.total} ${pluralize(summary.inventoryCounts.applications.total, 'app')}`
				: 'Apps: unavailable'}
		</a>
		<a href="/team/{team.slug}/jobs">
			{summary
				? `${summary.inventoryCounts.jobs.total} ${pluralize(summary.inventoryCounts.jobs.total, 'job')}`
				: 'Jobs: unavailable'}
		</a>
		<a href="/team/{team.slug}/issues">
			{#if summary && summary.criticalIssues.pageInfo.totalCount > 0}
				<Badge variant="destructive">
					{summary.criticalIssues.pageInfo.totalCount} critical
				</Badge>
			{:else if summary}
				{summary.issues.pageInfo.totalCount}
				{pluralize(summary.issues.pageInfo.totalCount, 'issue')}
			{:else}Issues: unavailable{/if}
		</a>
		<a href="/team/{team.slug}/vulnerabilities">Vulnerabilities</a>
	</div>
</article>

<style>
	.team-card {
		display: flex;
		flex-direction: column;
		background: var(--card);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		box-shadow: var(--sh-shadow-xs);
		overflow: hidden;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.team-card:only-child {
		grid-column: 1 / -1;
	}
	.team-card:hover {
		border-color: var(--border-strong);
		box-shadow: var(--sh-shadow-sm);
	}
	.team-card-main {
		display: flex;
		flex: 1;
		flex-direction: column;
		gap: var(--nais-space-8);
		padding: var(--nais-space-16);
		text-decoration: none;
	}
	.team-card-main:focus-visible {
		outline: var(--nais-space-2) solid var(--ring);
		outline-offset: calc(-1 * var(--nais-space-2));
	}
	.team-heading {
		display: flex;
		align-items: center;
		gap: var(--nais-space-12);
	}
	.team-title {
		flex: 1;
		min-width: 0;
	}
	.team-heading :global(.team-go-icon) {
		width: var(--nais-space-16);
		height: var(--nais-space-16);
		flex-shrink: 0;
	}
	.team-links {
		display: flex;
		align-items: center;
		gap: var(--nais-space-12);
		flex-wrap: wrap;
		padding: var(--nais-space-12) var(--nais-space-16);
		border-top: var(--sh-border-width) solid var(--border);
		font-size: var(--sh-font-size-sm);
	}
	.team-purpose {
		margin: 0;
		font-size: var(--sh-font-size-sm);
		color: var(--foreground);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	a,
	.surface-icon {
		color: var(--foreground);
	}
</style>
