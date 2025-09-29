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
		let results: { from: Date; to: Date; value: number }[] = [];
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

		// Ensure all data points are within the xDomain
		if (ctx.xDomain) {
			const xMin = ctx.xDomain[0] as unknown as Date;
			const xMax = ctx.xDomain[1] as unknown as Date;

			results = results.filter((item) => item.to >= xMin && item.from <= xMax);

			results.forEach((item) => {
				if (item.from < xMin) {
					item.from = xMin;
				}
				if (item.to > xMax) {
					item.to = xMax;
				}
			});
		}
		return results;
	});

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
		class={['stroke-surface-content', colorClass]}
	/>

	{#if i == combinedData.length - 1 && label}
		<Text
			value={label}
			{...labelProps(item)}
			class={['pointer-events-none text-xs', labelColorClass]}
		/>
	{/if}
{/each}
