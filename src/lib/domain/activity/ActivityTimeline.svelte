<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import type { Component } from 'svelte';

	import { icons } from './activity-log-icons';

	interface Entry {
		id: string;
		__typename: string;
		[key: string]: unknown;
	}

	interface Props {
		entries: Entry[];
		hasNextPage: boolean;
		loading: boolean;
		loadMore: () => void;
		textComponentFn: (typename: string) => Component<{ data: unknown }>;
	}

	let { entries, hasNextPage, loading, loadMore, textComponentFn }: Props = $props();
</script>

<div class="timeline">
	{#if entries.length > 0}
		{#each entries as entry (entry.id)}
			{@const Icon = icons[entry.__typename] || RocketIcon}
			{@const TextComponent = textComponentFn(entry.__typename)}
			<div class="activity-item">
				<div class="activity-icon">
					<Icon width="75%" height="75%" />
				</div>
				<div class="content">
					<TextComponent data={entry} />
				</div>
			</div>
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

	.activity-icon {
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		font-size: 1rem;
		flex-shrink: 0;
		color: var(--surface-accent-color);
	}

	.activity-item {
		display: flex;
		position: relative;
		padding-bottom: 0.75rem;
	}

	.content {
		flex: 1 1 auto;
		min-width: 0;
		overflow-wrap: anywhere;
		padding: 0 0 0 var(--ax-space-8);
	}

	.activity-item:not(:last-child)::before {
		background: var(--ax-border-neutral-subtleA);
		content: '';
		height: 100%;
		left: calc(1rem - 1px);
		position: absolute;
		top: 2rem;
		width: 2px;
		z-index: 0;
	}

	.empty {
		text-align: center;
		color: var(--ax-text-subtle);
		padding: var(--ax-space-8) var(--ax-space-4);
		font-style: italic;
	}

	.load-more {
		display: flex;
		justify-content: center;
		padding-top: var(--ax-space-4);
	}

	@media (max-width: 767px) {
		.activity-item:not(:last-child)::before {
			display: none;
		}
	}
</style>
