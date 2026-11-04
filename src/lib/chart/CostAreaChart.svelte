<script lang="ts">
	import { AreaChart } from 'layerchart';
	import LegendWrapper, { legendSnippet } from './LegendWrapper.svelte';
	import { createEuroAxis, serviceColor } from './util';
	import { euroTooltipFormatter } from '#lib/utils/formatters.js';

	let {
		data,
		height = '300px'
	}: {
		data: {
			date: Date;
			[key: string]: number | Date;
		}[];
		height?: `${number}px`;
	} = $props();

	const series = $derived.by(() => {
		if (data.length == 0) return [];

		const series = Array.from(
			data
				.flatMap((item) => Object.keys(item))
				.reduce((acc, key) => acc.add(key), new Set<string>())
		)
			.filter((key) => key !== 'date')
			.map((key) => ({ key, color: serviceColor(key) }));

		const firstData = data.at(0);

		return series.toSorted((a, b) => {
			const aValue = (firstData?.[a.key] as number) ?? 0;
			const bValue = (firstData?.[b.key] as number) ?? 0;
			return aValue - bValue;
		});
	});

	const fixedData = $derived.by(() => {
		return data.map((item) => {
			series.forEach((s) => {
				if (!(s.key in item)) {
					item[s.key] = 0;
				}
			});
			return item;
		});
	});

	const euroAxis = $derived(
		createEuroAxis(
			fixedData.reduce(
				(max, item) =>
					Math.max(
						max,
						series.reduce((total, s) => total + Math.abs(Number(item[s.key])), 0)
					),
				0
			)
		)
	);
</script>

{#if data.length > 0}
	<LegendWrapper {height}>
		<AreaChart
			padding={{ left: euroAxis.paddingLeft }}
			data={fixedData}
			{series}
			seriesLayout="stack"
			x="date"
			legend={legendSnippet}
			props={{
				highlight: {
					motion: 'none'
				},
				area: {
					fillOpacity: 0.6
				},
				yAxis: {
					format: euroAxis.format
				},
				tooltip: {
					item: {
						format: euroTooltipFormatter
					}
				},
				xAxis: {
					format: 'day'
				}
			}}
		/>
	</LegendWrapper>
{/if}
