<script lang="ts">
	import { type DataProduct$result } from '$houdini';
	import { accessor, PieChart, Tooltip } from 'layerchart';
	import type { PageProps } from './$types';

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

	const chartData = $derived.by(() => {
		if (!$DataProduct.data) return [];
		const totals = calculateTotals($DataProduct.data);
		return Object.entries(totals).map(([name, value]) => ({
			fruit: name,
			value
		}));
	});

	const total = $derived(Object.values(chartData).reduce((sum, item) => sum + item.value, 0));
</script>

<div class="page">
	{#if $DataProduct.data}
		<ul>
			<li>CPU: {$DataProduct.data.currentUnitPrices.cpu.value}</li>
			<li>MEM:{$DataProduct.data.currentUnitPrices.memory.value}</li>
		</ul>
		<div class="h-175">
			<PieChart
				data={chartData}
				key="fruit"
				value="value"
				outerRadius={250}
				legend={{
					placement: 'top-left',
					orientation: 'vertical'
				}}
				props={{ pie: { motion: 'tween' } }}
			>
				{#snippet tooltip({ series, context })}
					<Tooltip.Root>
						{#snippet children({ data })}
							<Tooltip.List>
								{#each series as s (s.key)}
									{@const valueAccessor = accessor(s.value ?? s.key)}
									<Tooltip.Item label={data.fruit} color={context.cScale?.(context.c(data))}>
										{valueAccessor(data)}
										{total > 0 ? `(${((valueAccessor(data) / total) * 100).toFixed(2)}%)` : ''}
									</Tooltip.Item>
								{/each}
							</Tooltip.List>
						{/snippet}
					</Tooltip.Root>
				{/snippet}
			</PieChart>
		</div>
	{/if}
</div>

<style>
</style>
