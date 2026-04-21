<script lang="ts">
	import CostChart from '$lib/chart/CostChart.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { Heading, HelpText, Loader } from '@nais/ds-svelte-community';
	import { queryStore } from '@urql/svelte';

	interface Props {
		teamSlug: string;
	}

	let { teamSlug }: Props = $props();

	const AggregatedTeamCostQuery = gql(/* GraphQL */ `
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

	const client = getContextClient();

	const costQuery = $derived(
		queryStore({
			client,
			query: AggregatedTeamCostQuery,
			variables: { team: teamSlug },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($costQuery);

	// `Date` scalar is `YYYY-MM-DD` on the wire (urql codegen surfaces it as
	// `string`). Normalize to `Date` so the existing date-math helpers can
	// keep using `getDate()` / `getMonth()` / `getFullYear()` unchanged.
	const series = $derived(
		(result.data?.team.cost.monthlySummary.series ?? []).map((s) => ({
			date: new Date(s.date),
			cost: s.cost
		}))
	);

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
	<GraphErrors errors={result.error?.graphQLErrors ?? null} />
	{#if !result.fetching || result.data}
		{#if result.data && series.length > 0}
			<div style="margin-bottom: var(--ax-space-16)">
				{#if series.length > 1}
					{@const factor = getFactor(series)}
					{#each series.slice(0, 2) as item (item.date.toISOString())}
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
				{:else if series.length == 1}
					{@const c = series[0]}
					{c.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
						getEstimateForMonth(c.cost, c.date)
					)}
				{:else}
					No cost data available
				{/if}
			</div>

			<CostChart data={series} dateField="date" valueField="cost" class="h-75" />
		{:else}
			<div class="no-data">
				<p>No cost data available</p>
			</div>
		{/if}
	{:else}
		<div class="loading h-75">
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
