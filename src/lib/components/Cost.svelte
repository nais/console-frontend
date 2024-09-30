<script lang="ts">
	import { graphql } from '$houdini';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Alert } from '@nais/ds-svelte-community';
	import type { AggregatedCostAppVariables } from './$houdini';

	export const _AggregatedCostAppVariables: AggregatedCostAppVariables = () => {
		return { team: team };
	};

	const costQuery = graphql(`
		query AggregatedCostApp($team: Slug!) @load {
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

	$: monthlySummary = $costQuery.data?.team.cost.monthlySummary;

	function getEstimateForMonth(cost: number, date: Date) {
		const daysKnown = date.getDate();
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const costPerDay = cost / daysKnown;
		return euroValueFormatter(costPerDay * daysInMonth);
	}

	function getFactor(series: { date: Date; cost: number }[]) {
		if (series.length < 2) {
			return 1.0;
		}

		const daysKnown = series[0].date.getDate();
		const estCostPerDay = series[0].cost / daysKnown;

		return (estCostPerDay / (series[1].cost / series[1].date.getDate())) * 100 - 100;
	}
</script>

{#if $costQuery.errors}
	<Alert variant="error">
		{#each $costQuery.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
{#if monthlySummary}
	<div>
		{#if monthlySummary.series.length > 1}
			{@const factor = getFactor(monthlySummary.series)}
			{#each monthlySummary.series.slice(0, 2) as cost}
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
		{:else if monthlySummary.series.length == 1}
			{@const cost = monthlySummary.series[0]}
			{cost.date.toLocaleString('en-GB', { month: 'long' })} (estimated): {getEstimateForMonth(
				cost.cost,
				cost.date
			)}
		{:else}
			No cost data available
		{/if}
	</div>
{/if}
