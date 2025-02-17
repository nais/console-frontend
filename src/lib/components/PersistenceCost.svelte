<script lang="ts">
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { Detail, Heading, HelpText } from '@nais/ds-svelte-community';
	import { CaretDownFillIcon, CaretUpFillIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';

	interface Props {
		title: string;
		costData: CostData;
		from: Date;
		to: Date;
		teamSlug: string;
	}

	let { title, costData, from, to, teamSlug }: Props = $props();

	const costTransform = (
		data: {
			readonly date: Date;
			readonly sum: number;
		}[]
	): EChartsOption => {
		return {
			height: '230px',
			width: '300px',
			tooltip: {
				// axisPointer: {
				// 	type: 'shadow'
				// },
				trigger: 'axis',
				formatter: (params: CallbackDataParams[]) =>
					`${params[0].name}: <b>${euroValueFormatter(params[0].value as number)}</b>`
			},
			grid: {
				top: '50',
				left: '0',
				containLabel: true
			},
			xAxis: {
				data: data.map((entry) => format(entry.date, 'dd.MM'))
			},
			yAxis: {
				axisLabel: {
					formatter: (value: number) => euroValueFormatter(value)
				}
			},
			series: {
				name: 'Bucket cost',
				type: 'line',
				emphasis: { focus: 'series' },
				symbol: 'none',
				data: data.map(({ sum }) => sum)
			}
		} as EChartsOption;
	};

	export type CostData = {
		readonly daily: {
			readonly series: {
				readonly date: Date;
				readonly sum: number;
			}[];
		};
	};

	function calculateMonthlyCostEstimates(costData: CostData | null) {
		if (!costData) return { firstMonthSum: 0, estimatedSecondMonthSum: 0 };

		const series = costData.daily.series;

		if (series.length === 0) return { firstMonthSum: 0, estimatedSecondMonthSum: 0 };

		// Sort dataset by date to ensure first entry is truly the earliest
		const sortedSeries = [...series].sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
		);

		// Extract unique months from dataset
		const uniqueMonths = new Set(
			sortedSeries.map((entry) => {
				const date = new Date(entry.date);
				return `${date.getFullYear()}-${date.getMonth()}`;
			})
		);

		// If there's only one month in the dataset, estimate that month and return 0 for the previous
		if (uniqueMonths.size === 1) {
			const firstEntryDate = new Date(sortedSeries[0].date);
			const currentMonth = firstEntryDate.getMonth();
			const currentYear = firstEntryDate.getFullYear();
			const totalDaysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

			let currentMonthSum = 0;
			let currentMonthDays = 0;

			for (const entry of series) {
				currentMonthSum += entry.sum;
				currentMonthDays++;
			}

			const estimatedCurrentMonthSum =
				currentMonthDays > 0 ? (currentMonthSum / currentMonthDays) * totalDaysInCurrentMonth : 0;

			return { firstMonthSum: 0, estimatedSecondMonthSum: estimatedCurrentMonthSum };
		}

		// Otherwise, proceed with normal calculations for first and second month
		const firstEntryDate = new Date(sortedSeries[0].date);
		const firstMonth = firstEntryDate.getMonth();
		const firstYear = firstEntryDate.getFullYear();
		const secondMonth = (firstMonth + 1) % 12;
		const secondYear = firstMonth === 11 ? firstYear + 1 : firstYear;
		const totalDaysInSecondMonth = new Date(secondYear, secondMonth + 1, 0).getDate();

		let firstMonthSum = 0;
		let secondMonthSum = 0;
		let secondMonthDays = 0;

		for (const entry of series) {
			const entryDate = new Date(entry.date);
			const entryMonth = entryDate.getMonth();
			const entryYear = entryDate.getFullYear();

			if (entryMonth === firstMonth && entryYear === firstYear) {
				firstMonthSum += entry.sum;
			} else if (entryMonth === secondMonth && entryYear === secondYear) {
				secondMonthSum += entry.sum;
				secondMonthDays++;
			}
		}

		const estimatedSecondMonthSum =
			secondMonthDays > 0 ? (secondMonthSum / secondMonthDays) * totalDaysInSecondMonth : 0;

		return { firstMonthSum, estimatedSecondMonthSum };
	}

	const { firstMonthSum, estimatedSecondMonthSum } = calculateMonthlyCostEstimates(costData);
</script>

<div>
	<div class="heading">
		<Heading size="small" level="3">{title}</Heading>
		<HelpText title="Cost description"
			>Total cost for the previous month and a projected estimate for this month.</HelpText
		>
	</div>

	<div class="cost-summary">
		<div class="estimated-cost">
			<Detail>
				{new Date(to ?? '').toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(estimatedSecondMonthSum)}
				{#if estimatedSecondMonthSum > firstMonthSum}
					<CaretUpFillIcon style="color: var(--a-surface-danger);" />
				{:else}
					<CaretDownFillIcon style="color: var(--a-surface-success);" />
				{/if}
			</Detail>
		</div>
		<div>
			<Detail>
				{new Date(from ?? '').toLocaleString('en-US', {
					month: 'long'
				})}: {euroValueFormatter(firstMonthSum)}
			</Detail>
		</div>
	</div>

	<EChart options={costTransform(costData.daily.series)} />

	<a href="/team/{teamSlug}/cost">See cost details</a>
</div>

<style>
	.heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.cost-summary {
		gap: var(--a-spacing-1-alt);
		.estimated-cost {
			display: flex;
			align-items: center;
			gap: var(--a-spacing-1);
		}
	}
</style>
