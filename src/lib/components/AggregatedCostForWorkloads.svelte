<script lang="ts">
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { Detail } from '@nais/ds-svelte-community';
	import { CaretDownFillIcon, CaretUpFillIcon } from '@nais/ds-svelte-community/icons';
	import { format, lastDayOfMonth } from 'date-fns';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';

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

	function aggregateAndSortCostByDate(
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
	): { date: Date; sum: number }[] {
		const aggregated: Map<string, number> = new Map();
		if (!series) {
			return [];
		}
		const oneYearAgo = new Date();
		oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

		series.forEach((entry) => {
			entry.cost.monthly.series.forEach(({ date, sum }) => {
				if (date >= oneYearAgo) {
					const dateKey = date.toISOString().split('T')[0];
					aggregated.set(dateKey, (aggregated.get(dateKey) || 0) + sum);
				}
			});
		});

		// Convert to an array and sort by date
		return Array.from(aggregated.entries())
			.map(([dateStr, sum]) => ({ date: new Date(dateStr), sum }))
			.sort((a, b) => a.date.getTime() - b.date.getTime());
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
		let estimateCurrentMonth = getEstimateForMonth(data[data.length - 1]);
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
			width: '250px',
			height: '150px',
			tooltip: {
				// axisPointer: {
				// 	type: 'shadow'
				// },
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

{#if data}
	{@const options = costTransform(data)}
	<div class="cost-summary">
		<div class="estimated-cost">
			<Detail>
				{data[data.length - 1].date.toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(data[data.length - 1].sum)}
				{#if data[data.length - 1].sum > data[data.length - 2].sum}
					<CaretUpFillIcon style="color: var(--a-surface-danger);" />
				{:else}
					<CaretDownFillIcon style="color: var(--a-surface-success);" />
				{/if}
			</Detail>
		</div>
		<div>
			<Detail>
				{data[data.length - 2].date.toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(data[data.length - 2].sum)}
			</Detail>
		</div>
	</div>

	<EChart {options} />
{/if}
