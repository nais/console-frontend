<script lang="ts">
	import type { ActivityLogEntryFragment } from '$houdini';
	import ActivityLogListItem from '#lib/domain/list-items/ActivityLogListItem.svelte';
	import { ShButton } from '#lib/shadcn/ui/index.js';
	import type { TimelineModes } from './shared/texts/types';

	interface Props {
		entries: ActivityLogEntryFragment[];
		hasNextPage: boolean;
		loading: boolean;
		loadMore: () => void;
		mode?: TimelineModes;
	}

	let { entries, hasNextPage, loading, loadMore, mode = 'sidebar' }: Props = $props();
</script>

<div class="timeline">
	{#if entries.length > 0}
		{#each entries as entry, i (i)}
			<ActivityLogListItem item={entry} {mode} />
		{/each}

		{#if hasNextPage}
			<div class="load-more">
				<ShButton variant="outline" size="sm" onclick={loadMore} disabled={loading}>
					{loading ? 'Loading…' : 'Load more'}
				</ShButton>
			</div>
		{/if}
	{:else}
		<p class="empty">No activity log entries found.</p>
	{/if}
</div>

<style>
	.timeline {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		min-width: 0;
	}

	.empty {
		text-align: center;
		color: var(--muted-foreground);
		padding: var(--ax-space-8) var(--ax-space-4);
		font-size: 0.8125rem;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: var(--ax-space-8);
	}
</style>
