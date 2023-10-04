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
		console.log(daysKnown);
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		console.log(daysInMonth);
		const costPerDay = cost / daysKnown;
		console.log(costPerDay);
		return euroValueFormatter(costPerDay * daysInMonth);
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
		{:else}
			{@const cost = $costQuery.data.monthlyCost.cost}
			{#if cost.length > 0}
				Estimated cost for {cost[0].date.toLocaleString('en-GB', { month: 'long' })}: {getEstimateForMonth(
					cost[0].cost,
					cost[0].date
				)}
			{/if}
			{#if cost.length > 1}
				<br />
				Accumulated cost for {cost[1].date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
					cost[1].cost
				)}
			{/if}
		{/if}
	</div>
{/if}

<style>
	h4 {
		margin-bottom: 8px;
	}
	div {
		display: flex;
		flex-direction: column;
	}
</style>
