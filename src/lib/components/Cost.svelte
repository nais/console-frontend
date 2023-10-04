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
		{:else if $costQuery.data.monthlyCost.cost.length > 0}
			{#each $costQuery.data.monthlyCost.cost.slice(0, 2) as cost}
				<!-- only use word estimated if last day in month-->
				{#if cost.date.getDate() === new Date(cost.date.getFullYear(), cost.date.getMonth() + 1, 0).getDate()}
					Accumulated cost for {cost.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
						cost.cost
					)}
				{:else}
					Estimated cost for {cost.date.toLocaleString('en-GB', { month: 'long' })}: {getEstimateForMonth(
						cost.cost,
						cost.date
					)}
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
	div {
		display: flex;
		flex-direction: column;
	}
</style>
