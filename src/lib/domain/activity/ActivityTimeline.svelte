<script lang="ts">
	import type { ActivityLogEntryFragment } from '$houdini';
	import ActivityLogListItem from '$lib/domain/list-items/ActivityLogListItem.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import type { TimelineModes } from './shared/texts/types';

	interface Props {
		entries: ({ id: string } & ActivityLogEntryFragment)[];
		hasNextPage: boolean;
		loading: boolean;
		loadMore: () => void;
		mode?: TimelineModes;
	}

	let { entries, hasNextPage, loading, loadMore, mode = 'sidebar' }: Props = $props();
</script>

<div class="timeline">
	{#if entries.length > 0}
		{#each entries as entry (entry.id)}
			<ActivityLogListItem item={entry} {mode} />
		{/each}

		{#if hasNextPage}
			<div class="load-more">
				<Button variant="tertiary" size="small" onclick={loadMore} {loading}>Load more</Button>
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
		color: var(--ax-text-neutral);
		padding: var(--ax-space-8) var(--ax-space-4);
		font-style: italic;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: var(--ax-space-4);
	}
</style>
