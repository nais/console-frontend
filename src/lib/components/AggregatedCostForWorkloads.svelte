<script lang="ts">
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { Detail } from '@nais/ds-svelte-community';
	import { CaretDownFillIcon, CaretUpFillIcon } from '@nais/ds-svelte-community/icons';
	import { format, lastDayOfMonth } from 'date-fns';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import { aggregateAndSortCostByDate } from './cost';

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

	const costTransform = (
		series: {
			date: Date;
			sum: number;
		}[]
	): EChartsOption => {
		return {
			animation: false,
			height: '230px',
			width: '280px',
			tooltip: {
				trigger: 'axis',
				formatter: (params: CallbackDataParams[]) =>
					`${params[0].name}: <b>${euroValueFormatter(params[0].value as number)}</b>`
			},
			grid: {
				top: '25',
				left: '0',
				containLabel: true
			},
			xAxis: {
				data: series.map((entry) => format(entry.date, 'MMM'))
			},
			yAxis: {
				axisLabel: {
					formatter: (value: number) => {
						if (value < 1000) {
							return euroValueFormatter(value);
						}
						return '€' + (value / 1000).toFixed(0) + 'k';
					}
				}
			},
			series: {
				name: 'Bucket cost',
				type: 'line',
				emphasis: { focus: 'series' },
				symbol: 'none',
				data: series.map(({ sum }) => sum)
			}
		} as EChartsOption;
	};
</script>

{#if data.length}
	{@const options = costTransform(data)}
	<div class="summary">
		<div class="estimated-cost">
			<Detail>
				{data.at(-1)?.date.toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(data.at(-1)?.sum)}
				{#if (data.at(-1)?.sum ?? 0) > (data.at(-2)?.sum ?? 0)}
					<CaretUpFillIcon style="color: var(--ax-bg-danger-moderate, --a-surface-danger);" />
				{:else}
					<CaretDownFillIcon style="color: var(--ax-bg-success-moderate, --a-surface-success);" />
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

	<EChart {options} />
{:else}
	<Detail>Insufficient data to display cost.</Detail>
{/if}

<style>
	.summary {
		gap: var(--ax-space-6, --a-spacing-1-alt);
		.estimated-cost {
			display: flex;
			align-items: center;
			gap: var(--ax-space-4, --a-spacing-1);
		}
	}
</style>
