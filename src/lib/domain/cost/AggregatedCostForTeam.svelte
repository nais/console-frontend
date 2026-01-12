<script lang="ts">
	import { graphql } from '$houdini';
	import CostChart from '$lib/chart/CostChart.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Heading, HelpText, Loader } from '@nais/ds-svelte-community';

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

	$effect(() => {
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
		<Heading as="h2" size="small" spacing
			><a href="/team/{teamSlug}/cost">Aggregated Cost for {teamSlug}</a></Heading
		>
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

			<CostChart
				data={$costQuery.data.team.cost.monthlySummary.series}
				dateField="date"
				valueField="cost"
				class="h-[300px]"
			/>
		{:else}
			<div class="no-data">
				<p>No cost data available</p>
			</div>
		{/if}
	{:else}
		<div class="loading h-[300px]">
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

	.no-data {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
		color: var(--ax-text-neutral-subtle);
		font-style: italic;
	}
</style>
