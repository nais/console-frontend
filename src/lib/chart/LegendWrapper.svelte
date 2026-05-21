<script lang="ts" module>
	export { legendSnippet };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	import LegendWrapperData, {
		createLegendContext,
		type LegendSnippetProps
	} from './LegendWrapperData.svelte';

	let {
		children,
		height,
		ref = $bindable()
	}: { children: Snippet; height: `${number}px`; ref?: HTMLDivElement | null } = $props();

	const ctx = createLegendContext();
</script>

{#snippet legendSnippet({ context }: { context: LegendSnippetProps })}
	<LegendWrapperData {context} />
{/snippet}

<div class="container" bind:this={ref}>
	{#if ctx.hasLegend && ctx.items.length > 0}
		<div class="wrapper">
			<div class="legend-items">
				{#each ctx.items as item (item.key)}
					<button
						type="button"
						class="legend-item"
						class:deselected={ctx.selection &&
							!ctx.selection.isEmpty() &&
							!ctx.selection.isSelected(item.key)}
						onclick={() => ctx.selection?.toggle(item.key)}
					>
						<span class="legend-swatch" style="background-color: {item.color};"></span>
						<span class="legend-label">{item.label}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
	<div class="chart" style="height: {height};">
		{@render children()}
	</div>
</div>

<style>
	.container {
		width: 100%;
		min-width: 0;
	}

	.wrapper {
		margin-bottom: var(--ax-space-16);
	}

	.chart {
		width: 100%;
		min-width: 0;
	}

	.legend-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-8) var(--ax-space-16);
		justify-content: center;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		border: none;
		background: none;
		padding: var(--ax-space-2) var(--ax-space-4);
		border-radius: var(--ax-radius-8);
		cursor: pointer;
		transition: opacity 150ms ease;
	}

	.legend-item:hover {
		background: var(--ax-neutral-200);
	}

	.legend-item.deselected {
		opacity: 0.3;
	}

	.legend-swatch {
		width: 12px;
		height: 12px;
		border-radius: 2px;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral);
	}
</style>
