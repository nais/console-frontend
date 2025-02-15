<script lang="ts">
	import { graphql, PendingValue } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import { Heading, HelpText, Skeleton } from '@nais/ds-svelte-community';
	import type { AggregatedTeamCostVariables } from './$houdini';
	import Cost from './Cost.svelte';

	export const _AggregatedTeamCostVariables: AggregatedTeamCostVariables = () => {
		return { team: teamSlug };
	};

	const costQuery = graphql(`
		query AggregatedTeamCost($team: Slug!) @load {
			team(slug: $team) @loading {
				cost @loading {
					monthlySummary @loading {
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
		{#if cost.monthlySummary !== PendingValue}
			{#if cost.monthlySummary.series.length > 1}
				{@const factor = getFactor(cost.monthlySummary.series)}
				{#each cost.monthlySummary.series.slice(0, 2) as item (item)}
					{#if item.date.getDate() === new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0).getDate()}
						{item.date.toLocaleString('en-GB', { month: 'long' })}: <Cost cost={item.cost} />
					{:else}
						{item.date.toLocaleString('en-GB', { month: 'long' })}: <Cost
							cost={getEstimateForMonth(item.cost, item.date)}
						/>
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
				{c.date.toLocaleString('en-GB', { month: 'long' })}: <Cost
					cost={getEstimateForMonth(c.cost, c.date)}
				/>
			{:else}
				No cost data available
			{/if}
		{:else}
			<Skeleton variant="text" />: <Skeleton variant="text" /><br />
			<Skeleton variant="text" />: <Skeleton variant="text" />
		{/if}
	</div>

	<a href="/team/{teamSlug}/cost">View team costs</a>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
