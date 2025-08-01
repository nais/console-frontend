<script lang="ts">
	import { AreaChart } from 'layerchart';
	import { euroAxisFormatter, serviceColor } from './util';

	let {
		data
	}: {
		data: {
			date: Date;
			[key: string]: number | Date;
		}[];
		height?: number;
	} = $props();

	const series = $derived(
		data.length > 0
			? Object.keys(data[0])
					.filter((key) => key !== 'date')
					.map((key) => ({ key, color: serviceColor(key) }))
			: []
	);
</script>

{#if data.length > 0}
	<AreaChart
		padding={{ left: 40 }}
		{data}
		{series}
		seriesLayout="stack"
		x="date"
		legend={{
			placement: 'top',
			classes: {
				root: 'mb-2'
			}
		}}
		props={{
			area: {
				fillOpacity: 0.6
			},
			yAxis: {
				format: euroAxisFormatter
			},
			tooltip: {
				item: {
					format: {
						type: 'currency',
						options: {
							currency: 'EUR',
							style: 'currency'
						}
					}
				}
			},
			xAxis: {
				format: 'day'
			}
		}}
	/>
{/if}
