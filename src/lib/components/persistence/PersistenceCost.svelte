<script lang="ts">
	import EChart from '$lib/chart/EChart.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Detail, Heading, HelpText } from '@nais/ds-svelte-community';
	import { CaretDownFillIcon, CaretUpFillIcon } from '@nais/ds-svelte-community/icons';
	import { format } from 'date-fns';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';

	interface Props {
		pageName: string;
		costData: CostData;
		from: Date;
		to: Date;
		teamSlug: string;
	}

	let { pageName, costData, from, to, teamSlug }: Props = $props();

	const costTransform = (
		data: {
			readonly date: Date;
			readonly sum: number;
		}[]
	): EChartsOption => {
		return {
			height: '230px',
			width: '280px',
			animation: false,
			tooltip: {
				trigger: 'axis',
				formatter: (params: CallbackDataParams[]) =>
					`${params[0].name}: <b>${euroValueFormatter(params[0].value as number)}</b>`
			},
			grid: {
				top: '20',
				left: '0',
				containLabel: true
			},
			xAxis: {
				axisLabel: {
					color: themeSwitch.theme === 'dark' ? '#dfe1e5' : '#202733'
				},
				data: data.map((entry) => format(entry.date, data.length > 60 ? 'MMM' : 'dd.MM'))
			},
			yAxis: {
				axisLabel: {
					color: themeSwitch.theme === 'dark' ? '#dfe1e5' : '#202733',
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

		// Otherwise, calculate based on the last two months present in the data
		const lastMonthDate = new Date(sortedSeries.at(-1)!.date);
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const firstMonthDate = new Date(lastMonthDate);
		firstMonthDate.setMonth(lastMonthDate.getMonth() - 1);

		let firstMonthSum = 0;
		let secondMonthSum = 0;
		let secondMonthDays = 0;
		const totalDaysInSecondMonth = new Date(
			lastMonthDate.getFullYear(),
			lastMonthDate.getMonth() + 1,
			0
		).getDate();

		for (const entry of series) {
			const entryDate = new Date(entry.date);
			if (
				entryDate.getFullYear() === firstMonthDate.getFullYear() &&
				entryDate.getMonth() === firstMonthDate.getMonth()
			) {
				firstMonthSum += entry.sum;
			} else if (
				entryDate.getFullYear() === lastMonthDate.getFullYear() &&
				entryDate.getMonth() === lastMonthDate.getMonth()
			) {
				secondMonthSum += entry.sum;
				secondMonthDays++;
			}
		}

		const estimatedSecondMonthSum =
			secondMonthDays > 0 ? (secondMonthSum / secondMonthDays) * totalDaysInSecondMonth : 0;

		return { firstMonthSum, estimatedSecondMonthSum };
	}

	const { firstMonthSum, estimatedSecondMonthSum } = $derived(
		calculateMonthlyCostEstimates(costData)
	);
</script>

<div>
	<div class="heading">
		<Heading size="small" level="3">{pageName} Cost</Heading>
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
					<CaretUpFillIcon style="color: var(--ax-bg-danger-strong);" />
				{:else}
					<CaretDownFillIcon style="color: var(--ax-bg-success-strong);" />
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
	<div>
		<EChart options={costTransform(costData.daily.series)} />
	</div>

	<a href="/team/{teamSlug}/cost">See cost details</a>
</div>

<style>
	.heading {
		display: flex;
		gap: var(--ax-space-8);
		align-items: center;
	}
	.cost-summary {
		gap: var(--ax-space-6);
		.estimated-cost {
			display: flex;
			align-items: center;
			gap: var(--ax-space-4);
		}
	}
</style>
