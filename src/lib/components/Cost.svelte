<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Loading from '$lib/Loading.svelte';
	import { euroValueFormatter } from '$lib/utils/currency';
	import type { AggregatedCostAppVariables } from './$houdini';

	export const _AggregatedCostAppVariables: AggregatedCostAppVariables = () => {
		return { filter: { app: app, env: env, team: team } };
	};

	const costQuery = graphql(`
		query AggregatedCostApp($filter: MonthlyCostFilter!) @load {
			monthlyCost(filter: $filter) @loading {
				sum
				cost {
					date
					cost
				}
			}
		}
	`);

	export let app: string;
	export let env: string;
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
		console.log((estCostPerDay / (cost[1].cost / cost[1].date.getDate())) * 100 - 100);
		return (estCostPerDay / (cost[1].cost / cost[1].date.getDate())) * 100 - 100;
	}
</script>

{#if $costQuery.errors}
	{#each $costQuery.errors as error}
		{error.message}
	{/each}
{/if}
{#if $costQuery.data !== null}
	<h4>Cost</h4>
	<div>
		{#if $costQuery.data.monthlyCost === PendingValue}
			<Loading />
		{:else if $costQuery.data.monthlyCost.cost.length > 0}
			{@const factor = getFactor($costQuery.data.monthlyCost.cost)}
			{#each $costQuery.data.monthlyCost.cost.slice(0, 2) as cost}
				{#if cost.date.getDate() === new Date(cost.date.getFullYear(), cost.date.getMonth() + 1, 0).getDate()}
					{cost.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(cost.cost)}
				{:else}
					{cost.date.toLocaleString('en-GB', { month: 'long' })} (estimated): {getEstimateForMonth(
						cost.cost,
						cost.date
					)}
					{#if factor > 1.0}
						(<span style="color: var(--a-surface-danger);">+{factor.toFixed(2)}%</span>)
					{:else}
						(<span style="color: var(--a-surface-success);">-{(1.0 - factor).toFixed(2)}%</span>)
					{/if}
				{/if}
				<br />
			{/each}
		{:else}
			No cost data available
		{/if}
	</div>
{/if}

<style>
	h4 {
		margin-bottom: 8px;
	}
</style>
