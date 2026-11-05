<script lang="ts" generics="T extends object">
	import { BarChart } from 'layerchart';
	import prettyBytes from 'pretty-bytes';
	import { truncateString } from './util';

	let {
		data,
		format: format,
		xKey = 'key' as keyof T,
		yKey = 'overage' as keyof T,
		onBarClick
	}: {
		data: T[];
		xKey?: keyof T;
		yKey?: keyof T;
		format: 'cpu' | 'memory';
		onBarClick?: (bar: T) => void;
	} = $props();

	const formatYAxis = $derived(
		format == 'memory' ? prettyBytes : (value: number) => (value == null ? '0' : value.toString())
	);
</script>

<div class={['chart-container', { clickable: !!onBarClick }]}>
	<!-- Keep formatted byte ticks and rotated team labels inside the clipped chart. -->
	<BarChart
		{data}
		padding={{
			top: 24,
			bottom: 112,
			left: format === 'memory' ? 56 : 40,
			right: 40
		}}
		cRange={[format == 'cpu' ? '#83bff6' : '#91dc75']}
		x={xKey as string}
		y={yKey as string}
		onTooltipClick={!onBarClick
			? undefined
			: (event, detail) => {
					// goto(`/team/${teamSlug}/${detail.data.env}/app/${detail.data.name}/utilization`);
					onBarClick(detail.data);
				}}
		props={{
			yAxis: {
				format: formatYAxis
			},
			xAxis: {
				format(value: string) {
					return truncateString(value, 14);
				},
				tickLabelProps: {
					rotate: 300,
					textAnchor: 'end'
				}
			}
		}}
	/>
</div>

<style>
	.chart-container {
		width: 100%;
		height: 100%;
		min-width: 0;
		overflow: hidden;
	}

	.clickable :global(rect) {
		cursor: pointer;
	}
</style>
