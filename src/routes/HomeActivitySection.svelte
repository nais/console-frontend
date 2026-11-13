<script lang="ts">
	import { icons } from '#lib/domain/activity/activity-log-icons.js';
	import { envTagVariant } from '#lib/envTagVariant.js';
	import { QuestionmarkIcon } from '#lib/icons/index.js';
	import { Alert, Heading, ShButton, Tag } from '#lib/shadcn/ui/index.js';
	import Collection from '#lib/ui/Collection.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import ListItem from '#lib/ui/ListItem.svelte';
	import SectionBoundary from '#lib/ui/SectionBoundary.svelte';
	import Time from '#lib/ui/Time.svelte';
	import { exhaustive } from '#lib/utils/houdini.js';
	import type { HomeActivityStore } from '$houdini';
	import { homeActivityHref, homeActivityTeam } from './homeOverview.js';

	let { store, loadError }: { store: HomeActivityStore | null; loadError: string | null } =
		$props();
	const uid = $props.id();
	const activity = $derived(exhaustive($store?.data?.activityLog.nodes ?? []));
</script>

<section class="activity-section" aria-labelledby="{uid}-activity">
	<div class="section-heading activity-heading">
		<Heading as="h2" size="small" id="{uid}-activity">Recent activity across your teams</Heading>
		<ShButton variant="ghost" size="sm" href="/activity-log?myTeams=true">
			View activity log
		</ShButton>
	</div>
	<div class="activity-feed">
		<SectionBoundary message="Recent activity could not be displayed.">
			<GraphErrors errors={$store?.errors} />
			{#if loadError}
				<Alert variant="warning" size="small">{loadError}</Alert>
			{:else if $store?.errors?.length}
				<p>Recent activity is unavailable.</p>
			{:else if $store?.data}
				{#if activity.length}
					<div id="{uid}-activity-entries">
						<Collection headerless>
							{#each activity as entry (entry.id)}
								{const Icon = $derived(icons[entry.__typename] ?? QuestionmarkIcon)}
								<ListItem href={homeActivityHref(entry)}>
									<div class="activity-entry">
										<span class="surface-icon activity-icon"><Icon aria-hidden="true" /></span>
										<div class="entry">
											<p class="activity-message" title={entry.message}>{entry.message}</p>
											<div class="activity-meta">
												<span class="activity-scope">
													<strong>{homeActivityTeam(entry)}</strong>
													{#if entry.environmentName}
														<Tag size="xsmall" variant={envTagVariant(entry.environmentName)}
															>{entry.environmentName}</Tag
														>
													{/if}
												</span>
												{#if entry.resourceName !== homeActivityTeam(entry) && !entry.message.includes(entry.resourceName)}
													<span>{entry.resourceName}</span>
												{/if}
												<span>{entry.actor}</span>
												<span class="activity-time"><Time time={entry.createdAt} distance /></span>
											</div>
										</div>
									</div>
								</ListItem>
							{/each}
						</Collection>
					</div>
				{/if}
				{#if activity.length < $store.data.activityLog.nodes.length}
					<Alert variant="warning" size="small">
						Some activity types cannot be displayed yet. Open a team’s activity log for details.
					</Alert>
				{:else if !activity.length}
					<p>No changes across your teams in the last 7 days.</p>
				{/if}
			{:else}
				<p role="status">
					{$store?.fetching ? 'Loading recent activity…' : 'Recent activity is unavailable.'}
				</p>
			{/if}
		</SectionBoundary>
	</div>
</section>

<style>
	.section-heading {
		display: flex;
		align-items: center;
		gap: var(--nais-space-12);
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.activity-heading {
		padding: var(--nais-space-12) 0;
	}
	.activity-section {
		border-top: var(--sh-border-width) solid var(--border);
	}
	.activity-feed {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-12);
		min-width: 0;
		padding-top: var(--nais-space-8);
	}
	p {
		margin: 0;
		font-size: var(--sh-font-size-sm);
		color: var(--foreground);
	}
	.entry {
		display: flex;
		flex-direction: column;
		gap: var(--nais-space-6);
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.activity-entry {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: start;
		gap: var(--nais-space-12);
	}
	.activity-icon {
		--surface-icon-size: var(--nais-space-32);
		--surface-icon-glyph-size: var(--nais-space-16);
		color: var(--foreground);
	}
	.activity-message {
		font-size: var(--sh-font-size-body);
		font-weight: var(--sh-font-weight-medium);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.activity-meta,
	.activity-scope {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--nais-space-4) var(--nais-space-8);
		font-size: var(--sh-font-size-xs);
	}
	.activity-time {
		margin-left: auto;
	}
	@media (max-width: 767px) {
		.activity-entry {
			gap: var(--nais-space-8);
		}
		.activity-time {
			margin-left: 0;
		}
	}
</style>
