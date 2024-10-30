<script lang="ts">
	import { graphql } from '$houdini';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Alert } from '@nais/ds-svelte-community';
	import type { AggregatedTeamCostVariables } from './$houdini';

	export const _AggregatedTeamCostVariables: AggregatedTeamCostVariables = () => {
		return { team: team };
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

	export let team: string;

	function getEstimateForMonth(cost: number, date: Date) {
		const daysKnown = date.getDate();
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const costPerDay = cost / daysKnown;
		return euroValueFormatter(costPerDay * daysInMonth);
	}

	function getFactor(cost: { date: Date; cost: number }[]) {
		const daysKnown = cost[0].date.getDate();
		const estCostPerDay = cost[0].cost / daysKnown;
		return (estCostPerDay / (cost[1].cost / cost[1].date.getDate())) * 100 - 100;
	}
</script>

<h4>Cost</h4>
{#if $costQuery.errors}
	<Alert variant="error">
		{#each $costQuery.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if $costQuery.data !== null}
	{@const cost = $costQuery.data.team.cost}
	<div>
		{#if cost.monthlySummary.series.length > 1}
			{@const factor = getFactor(cost.monthlySummary.series)}
			{#each cost.monthlySummary.series.slice(0, 2) as item}
				{#if item.date.getDate() === new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0).getDate()}
					{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(item.cost)}
				{:else}
					{item.date.toLocaleString('en-GB', { month: 'long' })} (estimated): {getEstimateForMonth(
						item.cost,
						item.date
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
			{c.date.toLocaleString('en-GB', { month: 'long' })} (estimated): {getEstimateForMonth(
				c.cost,
				c.date
			)}
		{:else}
			No cost data available
		{/if}
	</div>

	<a href="/team/{team}/cost">View team costs</a>
{/if}
