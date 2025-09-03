<script lang="ts" module>
	export { legendSnippet };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import { Legend } from 'layerchart';
	import LegendWrapperData, {
		createLegendContext,
		type LegendSnippetProps
	} from './LegendWrapperData.svelte';

	let { children, height }: { children: Snippet; height: `${number}px` } = $props();

	const ctx = createLegendContext();
</script>

{#snippet legendSnippet(data: LegendSnippetProps)}
	<LegendWrapperData {data} />
{/snippet}

{#if ctx.data}
	{@const props = ctx.data.getLegendProps()}
	<div class="wrapper">
		<Legend {...props} />
	</div>
{/if}
<div class="chart h-[{height}]">
	{@render children()}
</div>

<style>
	.wrapper {
		margin-bottom: var(--ax-space-16);
	}

	.wrapper :global(.lc-legend-container) {
		width: 100%;
		position: unset;
		translate: unset;
	}

	.wrapper :global(.lc-legend-swatch-group) {
		width: 100%;
		flex-wrap: wrap;
		place-items: center;
		place-content: center;
	}
</style>
