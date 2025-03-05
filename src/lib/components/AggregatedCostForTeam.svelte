<script lang="ts">
	import { graphql } from '$houdini';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, HelpText } from '@nais/ds-svelte-community';
	import { format, lastDayOfMonth } from 'date-fns';
	import type { EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';
	import type { AggregatedTeamCostVariables } from './$houdini';

	export const _AggregatedTeamCostVariables: AggregatedTeamCostVariables = () => {
		return { team: teamSlug };
	};

	const costQuery = graphql(`
		query AggregatedTeamCost($team: Slug!) @load {
			team(slug: $team) {
				cost {
					monthlySummary {
						sum
						series {
							date
							cost
						}
					}
				}
			}
		}
	`);

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const costTransform = (
		data: {
			readonly date: Date;
			readonly cost: number;
		}[],
		lastMonthEstimate: number
	): EChartsOption => {
		data = data.toSorted((a, b) => a.date.getTime() - b.date.getTime()).slice(0, -1);

		data.push({ date: lastDayOfMonth(new Date()), cost: lastMonthEstimate });
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
				data: data.map((entry) => format(entry.date, 'MMM'))
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
				data: data.map(({ cost }) => cost)
			}
		} as EChartsOption;
	};

	function getEstimateForMonth(cost: number, date: Date) {
		const daysKnown = date.getDate();
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const costPerDay = cost / daysKnown;
		return costPerDay * daysInMonth;
	}

	function getFactor(cost: { date: Date; cost: number }[]) {
		const daysKnown = cost[0].date.getDate();
		const estCostPerDay = cost[0].cost / daysKnown;
		return (estCostPerDay / (cost[1].cost / cost[1].date.getDate())) * 100 - 100;
	}
</script>

<div class="wrapper">
	<div class="header">
		<Heading level="4" size="small" spacing>Cost</Heading>
		<HelpText title="Aggregated team cost"
			>Aggregated cost for team. Current month is estimated.</HelpText
		>
	</div>
	<GraphErrors errors={$costQuery.errors} />

	{#if $costQuery.data !== null}
		{@const cost = $costQuery.data.team.cost}
		<div>
			{#if cost.monthlySummary.series.length > 1}
				{@const factor = getFactor(cost.monthlySummary.series)}
				{#each cost.monthlySummary.series.slice(0, 2) as item (item)}
					{#if item.date.getDate() === new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0).getDate()}
						{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(item.cost)}
					{:else}
						{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
							getEstimateForMonth(item.cost, item.date)
						)}
						{#if factor > 1.0}
							(<span style="color: var(--a-surface-danger);">+{factor.toFixed(2)}%</span>)
						{:else}
							(<span style="color: var(--a-surface-success);">-{(1.0 - factor).toFixed(2)}%</span>)
						{/if}
					{/if}
					<br />
				{/each}
			{:else if cost.monthlySummary.series.length == 1}
				{@const c = cost.monthlySummary.series[0]}
				{c.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
					getEstimateForMonth(c.cost, c.date)
				)}
			{:else}
				No cost data available
			{/if}
		</div>
		<div style="height: 200px; overflow: hidden;">
			<EChart
				options={costTransform(
					cost.monthlySummary.series,
					getEstimateForMonth(
						cost.monthlySummary.series[0].cost,
						cost.monthlySummary.series[0].date
					)
				)}
			/>
		</div>

		<a href="/team/{teamSlug}/cost">View team costs</a>
	{/if}
</div>

<style>
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}
</style>
