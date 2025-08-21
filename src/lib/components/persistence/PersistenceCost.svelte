<script lang="ts">
	import CostChart from '$lib/chart/CostChart.svelte';
	import { serviceColor, type ServiceName } from '$lib/chart/util';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Detail, Heading, HelpText } from '@nais/ds-svelte-community';
	import { CaretDownFillIcon, CaretUpFillIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		pageName: string;
		costData: CostData;
		from: Date;
		to: Date;
		teamSlug: string;
		service: ServiceName;
	}

	let { pageName, costData, from, to, teamSlug, service }: Props = $props();

	export type CostData = {
		readonly daily: {
			readonly series: {
				// readonly services: {
				// 	readonly service: string;
				// }[];
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
		<!-- <EChart options={costTransform(costData.daily.series)} /> -->
		<CostChart
			data={costData.daily.series}
			dateField="date"
			valueField="sum"
			class="mt-3 mb-5 h-[220px] w-[93%] pl-[7%]"
			color={serviceColor(service)}
		/>
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
