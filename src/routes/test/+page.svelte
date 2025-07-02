<script lang="ts">
	import { BarChart } from 'layerchart';

	const wideData = [
		{
			year: 2019,
			apples: 3840,
			bananas: 1920,
			cherries: 960,
			grapes: 400
		},
		{
			year: 2018,
			apples: 1600,
			bananas: 1440,
			cherries: 960,
			grapes: 400
		},
		{
			year: 2017,
			apples: 820,
			bananas: 1000,
			cherries: 640,
			grapes: 400
		},
		{
			year: 2016,
			apples: 820,
			bananas: 560,
			cherries: 720,
			grapes: 400
		}
	];
</script>

<div class="wrapper">
	<BarChart
		data={wideData}
		x="year"
		series={[
			{ key: 'apples', color: 'var(--ax-danger-300)' },
			{
				key: 'bananas',
				color: 'var(--ax-brand-blue-200)'
			},
			{
				key: 'cherries',
				color: 'var(--ax-danger-300)'
			},
			{
				key: 'grapes',
				color: 'var(--ax-brand-blue-200)'
			}
		]}
		seriesLayout="stack"
		props={{
			xAxis: { format: 'none' },
			yAxis: { format: 'metric' },
			tooltip: {
				header: { format: 'none' }
			}
		}}
	/>
</div>

<style>
	.wrapper {
		height: 300px;
		padding: 1rem;
		border: 1px solid var(--color-border);
		border-radius: 0.25rem;
	}
</style>
