<script lang="ts">
	import {
		fragment,
		type WorkloadActivityEntryFragment,
		type WorkloadActivityEntryFragment$data,
		type WorkloadLatestActivityFragment
	} from '$houdini';
	import { Button } from '@nais/ds-svelte-community';
	import { RocketIcon } from '@nais/ds-svelte-community/icons';

	import { icons } from '../activity-log-icons';
	import { workloadActivityEntryFragment, workloadLatestActivityFragment } from './fragments';
	import WorkloadActivityText from './WorkloadActivityText.svelte';

	interface Props {
		activityLog: WorkloadLatestActivityFragment;
		href: string;
		title?: string;
	}

	let { activityLog, href, title = 'Latest activity' }: Props = $props();

	const data = $derived(fragment(activityLog, workloadLatestActivityFragment));
	const latestEntry = $derived($data.activityLog.nodes[0] ?? null);
	const latestData = $derived(
		latestEntry
			? fragment(latestEntry as WorkloadActivityEntryFragment, workloadActivityEntryFragment)
			: null
	);
	const Icon = $derived($latestData ? icons[$latestData.__typename] || RocketIcon : RocketIcon);
</script>

<div class="card-wrapper">
	<div class="card-header">
		<span class="eyebrow">{title}</span>
	</div>

	{#if latestData}
		<div class="card-content">
			<div class="card-icon">
				<Icon />
			</div>
			<div class="card-body">
				<div class="card-copy">
					<WorkloadActivityText data={$latestData as WorkloadActivityEntryFragment$data} />
				</div>
			</div>
		</div>
	{:else}
		<div class="card-content empty-state">No activity log entries found.</div>
	{/if}

	<Button as="a" {href} variant="tertiary" size="small">View activity log</Button>
</div>

<style>
	.card-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		padding: var(--ax-space-16);
		border-radius: var(--ax-radius-8);
		background: linear-gradient(
			180deg,
			color-mix(in oklab, var(--ax-bg-default) 40%, var(--ax-bg-neutral-soft)) 0%,
			var(--ax-bg-neutral-soft) 100%
		);
		box-shadow:
			0 12px 24px -24px var(--surface-shadow-color),
			0 4px 10px -12px var(--surface-shadow-color);
		width: 100%;
		min-width: 0;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.eyebrow {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		line-height: var(--ax-font-line-height-large);
		color: var(--ax-text-neutral-subtle);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.card-content {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--ax-space-12);
		align-items: start;
		width: 100%;
	}

	.card-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 2.75rem;
		height: 2.75rem;
		border-radius: var(--ax-radius-8);
		background-color: var(--ax-neutral-100);
		color: var(--ax-text-accent);
		flex-shrink: 0;
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
		.card-wrapper {
			padding: var(--ax-space-12);
		}

		.card-content {
			display: flex;
			flex-direction: column;
		}

		.empty-state {
			align-items: flex-start;
		}
	}
</style>
