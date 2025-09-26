<script lang="ts">
	import { graphql } from '$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { themeSwitch } from '$lib/stores/theme.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Heading, HelpText, Loader } from '@nais/ds-svelte-community';
	import { format, lastDayOfMonth } from 'date-fns';
	import { type EChartsOption } from 'echarts';
	import type { CallbackDataParams } from 'echarts/types/dist/shared';

	const costQuery = graphql(`
		query AggregatedTeamCost($team: Slug!) {
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

	$effect.pre(() => {
		costQuery.fetch({
			variables: {
				team: teamSlug
			}
		});
	});

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
			animation: false,
			height: '150px',
			tooltip: {
				trigger: 'axis',
				formatter: (params: CallbackDataParams[]) =>
					`${params[0].name}: <b>${euroValueFormatter(params[0].value as number)}</b>`
			},
			grid: {
				top: '25',
				left: '25',
				containLabel: true
			},
			xAxis: {
				axisLabel: {
					color: themeSwitch.theme === 'dark' ? '#dfe1e5' : '#202733'
				},
				data: data.map((entry) => format(entry.date, 'MMM'))
			},
			yAxis: {
				axisLabel: {
					color: themeSwitch.theme === 'dark' ? '#dfe1e5' : '#202733',
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
		<Heading level="4" size="small" spacing>Aggregated Cost for {teamSlug}</Heading>
		<HelpText title="Aggregated team cost"
			>Aggregated cost for team. Current month is estimated.</HelpText
		>
	</div>
	<GraphErrors errors={$costQuery.errors} />
	{#if !$costQuery.fetching}
		{#if $costQuery.data && $costQuery.data.team.cost.monthlySummary.series.length > 0}
			{@const cost = $costQuery.data.team.cost}
			<div style="margin-bottom: var(--ax-space-16)">
				{#if cost.monthlySummary.series.length > 1}
					{@const factor = getFactor(cost.monthlySummary.series)}
					{#each cost.monthlySummary.series.slice(0, 2) as item (item)}
						{#if item.date.getDate() === new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0).getDate()}
							{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
								item.cost
							)}
						{:else}
							{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
								getEstimateForMonth(item.cost, item.date)
							)}
							{#if factor > 1.0}
								(<span style="color: var(--ax-bg-danger-strong);">+{factor.toFixed(2)}%</span>)
							{:else}
								(<span style="color: var(--ax-text-success-subtle);"
									>-{(1.0 - factor).toFixed(2)}%</span
								>)
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

			<div style="height: 200px; overflow: hidden; margin-bottom: var(--ax-space-16)">
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

			<a href="/team/{teamSlug}/cost" style:align-self="end" style:margin-top="auto">View Cost</a>
		{/if}
	{:else}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{/if}
</div>

<style>
	.wrapper {
		min-height: 100%;
		display: flex;
		flex-direction: column;
	}

	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		width: 100%;
	}
</style>
