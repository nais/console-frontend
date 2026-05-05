<script lang="ts">
	import {
		fragment,
		type WorkloadActivityEntryFragment,
		type WorkloadActivityEntryFragment$data,
		type WorkloadLatestActivityFragment
	} from '$houdini';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { Button } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';
	import { get } from 'svelte/store';

	import { icons } from '../activity-log-icons';
	import { workloadActivityEntryFragment, workloadLatestActivityFragment } from './fragments';
	import WorkloadActivityText from './WorkloadActivityText.svelte';

	interface Props {
		activityLog: WorkloadLatestActivityFragment;
		href: string;
		title?: string;
	}

	let { activityLog, href, title = 'Latest activities' }: Props = $props();

	const data = $derived(fragment(activityLog, workloadLatestActivityFragment));
	const latestEntries = $derived.by(() =>
		$data.activityLog.nodes.map((entry) =>
			get(fragment(entry as WorkloadActivityEntryFragment, workloadActivityEntryFragment))
		)
	);

	function activityIcon(entry: WorkloadActivityEntryFragment$data) {
		return icons[entry.__typename] || RocketIcon;
	}
</script>

<SurfaceCard {title}>
	{#if latestEntries.length > 0}
		<div class:multi-item={latestEntries.length > 1} class="activity-list">
			{#each latestEntries as entry (entry.id)}
				{@const Icon = activityIcon(entry)}
				<div class="activity-item">
					<div class="card-content">
						<div class="surface-icon surface-icon-timeline">
							<Icon />
						</div>
						<div class="card-body">
							<div class="card-copy">
								<WorkloadActivityText data={entry} />
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="card-content empty-state">No activity log entries found.</div>
	{/if}

	<Button as="a" {href} variant="tertiary" size="small">View activity log</Button>
</SurfaceCard>

<style>
	.card-content {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-12);
		align-items: start;
		width: 100%;
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.activity-item {
		position: relative;
	}

	.activity-item:not(:last-child)::before {
		content: '';
		position: absolute;
		left: calc((var(--surface-icon-size) - 2px) / 2);
		top: calc(var(--surface-icon-size) + var(--surface-icon-connector-gap));
		bottom: calc(-1 * (var(--ax-space-12) - var(--surface-icon-connector-gap)));
		width: 2px;
		background: var(--ax-border-neutral-subtleA);
	}

	.activity-item :global(.surface-icon-timeline) {
		position: relative;
		z-index: 1;
	}

	.card-body {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.card-copy {
		min-width: 0;
	}

	.card-copy > :global(div) {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-4);
		font-size: var(--ax-font-size-large);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral);
		overflow-wrap: anywhere;
	}

	.card-copy :global(a) {
		color: inherit;
		text-decoration: none;
	}

	.card-copy :global(a:hover) {
		text-decoration: underline;
	}

	.card-copy :global(.aksel-body-short) {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-regular);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral-subtle);
	}

	.empty-state {
		align-items: center;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.card-content {
			display: flex;
			flex-direction: column;
		}

		.activity-item::before {
			display: none;
		}

		.empty-state {
			align-items: flex-start;
		}
	}
</style>
