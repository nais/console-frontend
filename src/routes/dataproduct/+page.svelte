<script lang="ts">
	import type { ResultOf } from '@graphql-typed-document-node/core';
	import { accessor, PieChart, Tooltip } from 'layerchart';
	import type { PageProps } from './$types';
	import type { DataProductQuery } from './dataproduct';

	let { data }: PageProps = $props();

	let { DataProduct } = $derived(data);

	type DataProductResult = NonNullable<ResultOf<typeof DataProductQuery>>;

	function calculateTotals(data: DataProductResult) {
		const totals: { [key: string]: number } = {};

		data.teams.nodes.forEach((node) => {
			const counts = node.inventoryCounts;

			for (const [type, value] of Object.entries(counts)) {
				if (type === '__typename' || !value || typeof value !== 'object' || !('total' in value)) {
					continue;
				}
				if (!totals[type]) {
					totals[type] = 0;
				}
				totals[type] += value.total;
			}
		});

		return totals;
	}

	const chartData = $derived.by(() => {
		if (!DataProduct.data) return [];
		const totals = calculateTotals(DataProduct.data);
		return Object.entries(totals).map(([name, value]) => ({
			fruit: name,
			value
		}));
	});

	const total = $derived(Object.values(chartData).reduce((sum, item) => sum + item.value, 0));
</script>

<div class="page">
	{#if DataProduct.data}
		<ul>
			<li>CPU: {DataProduct.data.currentUnitPrices.cpu.value}</li>
			<li>MEM:{DataProduct.data.currentUnitPrices.memory.value}</li>
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
