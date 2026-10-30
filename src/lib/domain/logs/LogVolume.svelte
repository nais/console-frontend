<script lang="ts">
	import { Button, Heading, Tooltip } from '@nais/ds-svelte-community';
	import type { VolumeBucket } from './loki.js';

	let {
		buckets,
		onselect
	}: {
		buckets: VolumeBucket[];
		onselect: (bucket: VolumeBucket) => void;
	} = $props();
	const id = $props.id();
	let focusedBucket = $state<number>();
	const maximum = $derived(Math.max(1, ...buckets.map((bucket) => bucket.count)));
	const hasVolume = $derived(buckets.some((bucket) => bucket.count > 0));
</script>

<section aria-labelledby={id}>
	<Heading as="h3" size="xsmall" class="aksel-sr-only" {id}>Log volume</Heading>
	<p class="aksel-sr-only">Select a bar to search that time interval.</p>
	<div class="histogram">
		{#each buckets as bucket (bucket.end)}
			{const label = $derived(
				`${new Date(bucket.start).toLocaleTimeString('en-GB')} – ${new Date(bucket.end).toLocaleTimeString('en-GB')}: ${bucket.count.toLocaleString()} log lines`
			)}
			<div class="bucket">
				<Tooltip content={label} open={focusedBucket === bucket.end}>
					<Button
						type="button"
						variant="tertiary"
						size="small"
						aria-label={`Search ${label}`}
						onclick={() => onselect(bucket)}
						onfocus={() => (focusedBucket = bucket.end)}
						onblur={() => (focusedBucket = undefined)}
						onkeydown={(event: KeyboardEvent) => {
							if (event.key === 'Escape') focusedBucket = undefined;
						}}
						style={`--bar-height: ${(bucket.count / maximum) * 100}%`}
					>
						<span class="bar" aria-hidden="true"></span>
					</Button>
				</Tooltip>
			</div>
		{/each}
	</div>
	{#if buckets.length > 0}
		<div class="axis" aria-hidden="true">
			<span>{new Date(buckets[0].start).toLocaleTimeString('en-GB')}</span>
			<span>{new Date(buckets.at(-1)!.end).toLocaleTimeString('en-GB')}</span>
		</div>
	{/if}
	{#if buckets.length > 0 && !hasVolume}
		<p>No log lines in this time range.</p>
	{/if}
</section>

<style>
	.histogram {
		display: flex;
		align-items: stretch;
		height: var(--ax-space-64);
		gap: var(--ax-space-2);
	}

	.bucket {
		flex: 1;
		min-width: 0;
		display: grid;
	}

	.bucket :global(button) {
		position: relative;
		width: 100%;
		height: 100%;
		min-width: 0;
		min-height: 0;
		padding: 0;
		border-radius: 0;
	}

	.bar {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		display: block;
		height: var(--bar-height);
		background: var(--ax-bg-info-strong);
		pointer-events: none;
	}

	.axis {
		display: flex;
		justify-content: space-between;
		font-size: var(--ax-font-size-small);
	}

	p {
		margin-block: var(--ax-space-8);
	}
</style>
