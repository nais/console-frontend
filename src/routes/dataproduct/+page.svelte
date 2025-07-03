<script lang="ts">
	import { type DataProduct$result } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import type { EChartsOption } from 'echarts';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { DataProduct } = $derived(data);

	function calculateTotals(data: DataProduct$result) {
		const totals: { [key: string]: number } = {};

		data.teams.nodes.forEach((node) => {
			const counts = node.inventoryCounts;

			for (const [type, { total }] of Object.entries(counts)) {
				if (!totals[type]) {
					totals[type] = 0;
				}
				totals[type] += total;
			}
		});

		return totals;
	}

	function renderChart(totals: { [key: string]: number }) {
		// Prepare data for the pie chart
		const chartData = Object.entries(totals).map(([name, value]) => ({
			name,
			value
		}));

		// Configure chart options
		const options = {
			title: {
				text: 'Inventory Totals',
				left: 'center'
			},
			tooltip: {
				trigger: 'item',
				formatter: '{a} <br/>{b}: {c} ({d}%)'
			},
			legend: {
				orient: 'vertical',
				left: 'left'
			},
			series: [
				{
					name: 'Inventory',
					type: 'pie',
					radius: '50%',
					data: chartData,
					emphasis: {
						itemStyle: {
							shadowBlur: 10,
							shadowOffsetX: 0,
							shadowColor: 'rgba(0, 0, 0, 0.5)'
						}
					}
				}
			]
		};

		// Set chart options
		return options as EChartsOption;
	}
</script>

<div class="page">
	{#if $DataProduct.data}
		<ul>
			<li>CPU: {$DataProduct.data.currentUnitPrices.cpu.value}</li>
			<li>MEM:{$DataProduct.data.currentUnitPrices.memory.value}</li>
		</ul>
		<EChart
			options={renderChart(calculateTotals($DataProduct.data))}
			style="height: 700px; width: 100%;"
		/>
	{/if}
</div>
