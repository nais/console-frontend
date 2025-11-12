<script lang="ts">
	import CostChart from '$lib/chart/CostChart.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Detail } from '@nais/ds-svelte-community';
	import { CaretDownFillIcon, CaretUpFillIcon } from '@nais/ds-svelte-community/icons';
	import { lastDayOfMonth } from 'date-fns';
	import { aggregateAndSortCostByDate } from '$lib/domain/cost/cost';

	interface Props {
		readonly nodes: {
			readonly cost: {
				readonly monthly: {
					readonly series: {
						readonly date: Date;
						readonly sum: number;
					}[];
				};
			};
		}[];
	}

	let { nodes }: Props = $props();

	function getEstimateForMonth(month: { sum: number; date: Date }): number {
		const daysKnown = month.date.getDate();
		const daysInMonth = new Date(month.date.getFullYear(), month.date.getMonth() + 1, 0).getDate();
		const costPerDay = month.sum / daysKnown;
		return costPerDay * daysInMonth;
	}

	const primeData = (
		series:
			| {
					readonly cost: {
						readonly monthly: {
							readonly series: {
								readonly date: Date;
								readonly sum: number;
							}[];
						};
					};
			  }[]
			| undefined
	): {
		date: Date;
		sum: number;
	}[] => {
		if (!series) {
			return [];
		}
		let data = aggregateAndSortCostByDate(series);
		if (data.length === 0) {
			return [];
		}
		let estimateCurrentMonth = getEstimateForMonth(data.at(-1)!);
		data.pop(); // Remove current month

		data.push({
			date: lastDayOfMonth(new Date()),
			sum: estimateCurrentMonth
		});
		return data;
	};

	let data = $derived.by(() => {
		return primeData(nodes);
	});
</script>

{#if data.length}
	<div class="summary">
		<div class="estimated-cost">
			<Detail>
				{data.at(-1)?.date.toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(data.at(-1)?.sum)}
				{#if (data.at(-1)?.sum ?? 0) > (data.at(-2)?.sum ?? 0)}
					<CaretUpFillIcon style="color: var(--ax-bg-danger-strong);" />
				{:else}
					<CaretDownFillIcon style="color: var(--ax-bg-success-strong);" />
				{/if}
			</Detail>
		</div>
		<div>
			<Detail>
				{data.at(-2)?.date.toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(data.at(-2)?.sum)}
			</Detail>
		</div>
	</div>

	<CostChart {data} dateField="date" valueField="sum" class="mt-3 mb-5 h-[180px] w-[93%] pl-[7%]" />
{:else}
	<Detail>Insufficient data to display cost.</Detail>
{/if}

<style>
	.summary {
		gap: var(--ax-space-6);
		.estimated-cost {
			display: flex;
			align-items: center;
			gap: var(--ax-space-4);
		}
	}
</style>
