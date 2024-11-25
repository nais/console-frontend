<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import type { AggregatedCostVariables } from './$houdini';

	export const _AggregatedCostVariables: AggregatedCostVariables = () => {
		return { workload: workload, environment: environment, team: team };
	};

	const costQuery = graphql(`
		query AggregatedCost($team: Slug!, $environment: String!, $workload: String!) @load {
			team(slug: $team) {
				environment(name: $environment) {
					workload(name: $workload) {
						cost {
							monthly {
								sum
								series {
									date
									sum
								}
							}
						}
					}
				}
			}
		}
	`);

	export let environment: string;
	export let workload: string;
	export let team: string;

	function getEstimateForMonth(cost: number, date: Date) {
		const daysKnown = date.getDate();
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const costPerDay = cost / daysKnown;
		return euroValueFormatter(costPerDay * daysInMonth);
	}

	function getFactor(cost: { date: Date; sum: number }[]) {
		const daysKnown = cost[0].date.getDate();
		const estCostPerDay = cost[0].sum / daysKnown;
		const retVal = (estCostPerDay / (cost[1].sum / cost[1].date.getDate())) * 100 - 100;
		if (retVal === Infinity || isNaN(retVal)) {
			return 0;
		}
		return (estCostPerDay / (cost[1].sum / cost[1].date.getDate())) * 100 - 100;
	}
</script>

<h4>Cost</h4>

<GraphErrors errors={$costQuery.errors} />

{#if $costQuery.data !== null}
	{@const cost = $costQuery.data.team.environment.workload.cost}
	<div>
		{#if cost.monthly.series.length > 1}
			{@const factor = getFactor(cost.monthly.series)}
			{#each cost.monthly.series.slice(0, 2) as item}
				{#if item.date.getDate() === new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0).getDate()}
					{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(item.sum)}
				{:else}
					{item.date.toLocaleString('en-GB', { month: 'long' })} (estimated): {getEstimateForMonth(
						item.sum,
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
		{:else if cost.monthly.series.length == 1}
			{@const c = cost.monthly.series[0]}
			{c.date.toLocaleString('en-GB', { month: 'long' })} (estimated): {getEstimateForMonth(
				c.sum,
				c.date
			)}
		{:else}
			No cost data available
		{/if}
	</div>
{/if}
