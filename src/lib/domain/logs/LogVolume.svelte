<script lang="ts">
	import { BodyShort, Heading, Loader } from '#lib/shadcn/ui/index.js';
	import { Chart, Rect, Tooltip } from 'layerchart';
	import { logDate, type LogRange, type VolumeBucket } from './loki.js';

	let {
		buckets,
		range,
		loading = false,
		onselect
	}: {
		buckets: VolumeBucket[];
		range?: LogRange;
		loading?: boolean;
		onselect: (bucket: VolumeBucket) => void;
	} = $props();
	const id = $props.id();
	let tooltipDismissed = $state(false);
	const maximum = $derived(Math.max(1, ...buckets.map((bucket) => bucket.count)));
	const hasVolume = $derived(buckets.some((bucket) => bucket.count > 0));
	const domain = $derived(
		(range
			? [logDate(range.start).getTime(), logDate(range.end).getTime()]
			: [buckets[0]?.start ?? 0, buckets.at(-1)?.end ?? 1]
		).map((timestamp) => new Date(timestamp))
	);

	function formatTime(value: number) {
		if (domain[1].getTime() - domain[0].getTime() >= 86_400_000) {
			return new Date(value).toLocaleString('en-GB', {
				day: 'numeric',
				month: 'short',
				hour: '2-digit',
				minute: '2-digit'
			});
		}
		return new Date(value).toLocaleTimeString('en-GB', {
			hour: '2-digit',
			minute: '2-digit',
			...(domain[1].getTime() - domain[0].getTime() < 60_000 ? { second: '2-digit' } : {})
		});
	}

	function intervalLabel(bucket: VolumeBucket) {
		return `${new Date(bucket.start).toLocaleString('en-GB')} – ${new Date(bucket.end).toLocaleString('en-GB')}: ${bucket.count.toLocaleString()} log lines`;
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.key === 'Escape') tooltipDismissed = true;
	}}
/>

<section aria-labelledby={id} aria-busy={loading}>
	<Heading as="h3" size="xsmall" class="sr-only" {id}>Log volume</Heading>
	<p id={`${id}-help`} class="sr-only">Select an interval to search its logs.</p>
	<div class={['visualization', { empty: !hasVolume || loading }]}>
		<Chart
			data={buckets}
			x="start"
			y="count"
			xDomain={domain}
			yDomain={[0, maximum]}
			padding={{ left: 48, right: 16, top: 16, bottom: 32 }}
			axis
			grid
			rule={false}
			highlight={false}
			pointerEvents={hasVolume && !loading}
			props={{
				xAxis: { format: formatTime, ticks: 4, tickOcclusion: true, rule: true },
				yAxis: {
					ticks: maximum > 1 ? 3 : [0, 1],
					format: (value: number) => (Number.isInteger(value) ? value.toLocaleString() : '')
				}
			}}
		>
			{#snippet marks({ context })}
				{#each buckets as bucket (bucket.end)}
					{const x = $derived(context.xScale(bucket.start))}
					{const width = $derived(context.xScale(bucket.end) - x)}
					<Rect
						{x}
						{width}
						y={context.yScale(bucket.count)}
						height={context.yScale(0) - context.yScale(bucket.count)}
						fill="var(--ax-bg-info-strong)"
						class="log-volume-bar"
						aria-hidden="true"
					/>
					<Rect
						{x}
						{width}
						y={0}
						height={context.height}
						fill="transparent"
						class="interval-target"
						role="button"
						tabindex={hasVolume && !loading ? 0 : -1}
						aria-disabled={!hasVolume || loading}
						aria-label={`Search ${intervalLabel(bucket)}`}
						aria-describedby={`${id}-help ${id}-tooltip-${bucket.end}`}
						onclick={() => {
							if (hasVolume && !loading) onselect(bucket);
						}}
						onkeydown={(event) => {
							if ((event.key === 'Enter' || event.key === ' ') && hasVolume && !loading) {
								event.preventDefault();
								onselect(bucket);
							}
						}}
						onfocus={() => {
							tooltipDismissed = false;
							context.tooltip.show({ data: bucket });
						}}
						onblur={() => context.tooltip.hide()}
						onpointerenter={() => {
							tooltipDismissed = false;
							context.tooltip.show({ data: bucket });
						}}
						onpointerleave={() => context.tooltip.hide()}
					/>
				{/each}
			{/snippet}
			{#snippet tooltip()}
				{#if !tooltipDismissed && hasVolume && !loading}
					<Tooltip.Root>
						{#snippet children({ data })}
							<div id={`${id}-tooltip-${data.end}`} role="tooltip" aria-label={intervalLabel(data)}>
								<Tooltip.Header>
									{new Date(data.start).toLocaleString('en-GB')} – {new Date(
										data.end
									).toLocaleTimeString('en-GB')}
								</Tooltip.Header>
								<Tooltip.List>
									<Tooltip.Item label="Log lines">{data.count.toLocaleString()}</Tooltip.Item>
								</Tooltip.List>
							</div>
						{/snippet}
					</Tooltip.Root>
				{/if}
			{/snippet}
		</Chart>
		{#if loading || !hasVolume}
			<div class="overlay">
				<div class="overlay-content" role="status">
					{#if loading}
						<Loader size="small" />
						<BodyShort size="small">Loading log volume…</BodyShort>
					{:else}
						<BodyShort>No logs match this query and time range.</BodyShort>
						<BodyShort size="small">Try a wider time range or adjust the filters.</BodyShort>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.visualization {
		position: relative;
		height: calc(var(--ax-space-64) * 3);
		min-width: 0;
	}

	.empty :global(svg) {
		opacity: 0.35;
	}

	.visualization :global(.interval-target) {
		cursor: pointer;
	}

	.visualization :global(.interval-target:focus-visible) {
		outline: var(--sh-border-width) solid var(--ring);
		outline-offset: calc(-1 * var(--sh-border-width));
	}

	.overlay {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		padding: var(--ax-space-16);
		pointer-events: none;
	}

	.overlay-content {
		display: grid;
		justify-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-16);
		border-radius: var(--ax-radius-8);
		background: var(--ax-bg-sunken);
		color: var(--ax-text-neutral);
		text-align: center;
	}
</style>
