<script lang="ts" module>
	export { legendSnippet };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Legend } from 'layerchart';
	import LegendWrapperData, { createLegendContext } from './LegendWrapperData.svelte';

	let {
		children,
		height,
		ref = $bindable()
	}: { children: Snippet; height: `${number}px`; ref?: HTMLDivElement | null } = $props();

	const ctx = createLegendContext();
</script>

{#snippet legendSnippet()}
	<LegendWrapperData />
{/snippet}

<div bind:this={ref}>
	{#if ctx.hasLegend}
		<div class="wrapper">
			<Legend />
		</div>
	{/if}
	<div class="chart" style="height: {height};">
		{@render children()}
	</div>
</div>

<style>
	.wrapper {
		margin-bottom: var(--ax-space-16);
	}

	.wrapper :global(.lc-legend-container) {
		all: unset;
		width: 100%;
	}

	.wrapper :global(.lc-legend-swatch-group) {
		width: 100%;
		flex-wrap: wrap;
		place-items: center;
		place-content: center;
	}
</style>
