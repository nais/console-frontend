<script lang="ts">
	import { getChartContext, Line, Text } from 'layerchart';

	const {
		data,
		colorClass,
		label,
		labelColorClass,
		labelPosition = 'above'
	}: {
		data: { timestamp: Date; value: number }[];
		colorClass: string;
		label?: string;
		labelColorClass?: string;
		labelPosition?: 'above' | 'below';
	} = $props();

	const ctx = getChartContext();

	// Combine all data points where the value is the same
	const combinedData: { from: Date; to: Date; value: number }[] = $derived.by(() => {
		const results: { from: Date; to: Date; value: number }[] = [];
		let currentFrom: Date | null = null;
		let currentValue: number | null = null;
		for (const item of data) {
			if (currentValue === null || item.value !== currentValue) {
				if (currentFrom !== null && currentValue !== null) {
					results.push({ from: currentFrom, to: item.timestamp, value: currentValue });
				}
				currentFrom = item.timestamp;
				currentValue = item.value;
			}
		}
		if (currentFrom !== null && currentValue !== null && data.length > 0) {
			results.push({ from: currentFrom, to: data.at(-1)!.timestamp, value: currentValue });
		}
		return results;
	});

	// {
	// 	x:
	// 		(labelPlacement.includes('left')
	// 			? line.x1
	// 			: labelPlacement.includes('right')
	// 				? line.x2
	// 				: (line.x2 - line.x1) / 2) +
	// 		(['left', 'top-right', 'bottom-right'].includes(labelPlacement)
	// 			? -labelXOffset
	// 			: labelXOffset),
	// 	y: line.y1 + (labelPlacement.includes('top') ? -labelYOffset : labelYOffset),
	// 	dy: -2, // adjust for smaller font size
	// 	textAnchor:
	// 		labelPlacement === 'left'
	// 			? 'end' // place beside line
	// 			: labelPlacement === 'right'
	// 				? 'start' // place beside line
	// 				: labelPlacement.includes('left')
	// 					? 'start'
	// 					: labelPlacement.includes('right')
	// 						? 'end'
	// 						: 'middle',
	// 	verticalAnchor: labelPlacement.includes('top')
	// 		? 'end'
	// 		: labelPlacement.includes('bottom')
	// 			? 'start'
	// 			: 'middle'
	// }

	function labelProps(item: (typeof combinedData)[number]) {
		// Label placement is right
		return {
			x: ctx.xScale(item.to) + 5,
			y: ctx.yScale(item.value),
			dy: -2,
			textAnchor: 'end' as const,
			verticalAnchor: labelPosition === 'above' ? ('end' as const) : ('start' as const)
		};
	}
</script>

{#each combinedData as item, i (item.from)}
	<Line
		x1={ctx.xScale(item.from)}
		y1={ctx.yScale(item.value)}
		x2={ctx.xScale(item.to)}
		y2={ctx.yScale(item.value)}
		class={['stroke-surface-content asdfasdf', colorClass]}
	/>
	<!-- <g class="lc-annotation-series asdfasdf">
		<line
			x1={ctx.xScale(item.from)}
			y1={ctx.yScale(item.value)}
			x2={ctx.xScale(item.to)}
			y2={ctx.yScale(item.value)}
			stroke="currentColor"
			stroke-width="2"
		/>
		<text
			x={(ctx.xScale(item.from) + ctx.xScale(item.to)) / 2}
			y={ctx.yScale(item.value) - 5}
			text-anchor="middle"
			fill="currentColor"
			font-size="12"
		>
			{item.value}
		</text>
	</g> -->

	{#if i == combinedData.length - 1 && label}
		<Text
			value={label}
			{...labelProps(item)}
			class={['pointer-events-none text-xs', labelColorClass, 'asdfasdf']}
		/>
	{/if}
{/each}
