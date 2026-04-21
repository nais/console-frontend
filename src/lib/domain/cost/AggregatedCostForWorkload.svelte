<script lang="ts">
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { graphql as gql } from '$lib/urql/gql';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { BodyShort, Heading, HelpText, Link } from '@nais/ds-svelte-community';
	import { queryStore } from '@urql/svelte';

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();

	const AggregatedCostQuery = gql(/* GraphQL */ `
		query AggregatedCost($team: Slug!, $environment: String!, $workload: String!) {
			team(slug: $team) {
				slug
				environment(name: $environment) {
					environment {
						name
					}
					workload(name: $workload) {
						__typename
						name
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

	const client = getContextClient();

	const costQuery = $derived(
		queryStore({
			client,
			query: AggregatedCostQuery,
			variables: { team: teamSlug, environment, workload },
			requestPolicy: 'cache-and-network'
		})
	);

	const result = $derived($costQuery);

	// `Date` scalar is `YYYY-MM-DD` on the wire (urql codegen surfaces it
	// as `string`). Normalize to `Date` so the existing date-math helpers
	// keep working unchanged.
	const series = $derived(
		(result.data?.team.environment.workload.cost.monthly.series ?? []).map((s) => ({
			date: new Date(s.date),
			sum: s.sum
		}))
	);

	function getEstimateForMonth(cost: number, date: Date): number {
		const daysKnown = date.getDate();
		const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
		const costPerDay = cost / daysKnown;
		return costPerDay * daysInMonth;
	}

	function getFactor(cost: { date: Date; sum: number }[]): number {
		if (cost.length < 1) {
			return 0;
		}
		const daysKnown = cost[0].date.getDate();
		const estCostPerDay = cost[0].sum / daysKnown;
		if (cost.length < 2) {
			return 0;
		}
		const retVal = (estCostPerDay / (cost[1].sum / cost[1].date.getDate())) * 100 - 100;
		if (retVal === Infinity || isNaN(retVal)) {
			return 0;
		}
		return (estCostPerDay / (cost[1].sum / cost[1].date.getDate())) * 100 - 100;
	}
</script>

<div class="wrapper">
	<div class="container">
		<Heading as="h3" size="small">Cost</Heading>
		<HelpText title="Aggregated workload cost"
			>Aggregated cost for workload. Current month is estimated.</HelpText
		>
	</div>

	<GraphErrors errors={result.error?.graphQLErrors ?? null} />

	{#if result.data}
		{@const factor = getFactor(series)}

		{#each series.slice(0, 2) as item (item.date.toISOString())}
			{#if item.date.getDate() === new Date(item.date.getFullYear(), item.date.getMonth() + 1, 0).getDate()}
				<BodyShort>
					{item.date.toLocaleString('en-GB', { month: 'long' })}:
					{euroValueFormatter(item.sum)}
				</BodyShort>
			{:else}
				<BodyShort>
					{item.date.toLocaleString('en-GB', { month: 'long' })}: {euroValueFormatter(
						getEstimateForMonth(item.sum, item.date)
					)}
					{#if series.length > 1}
						{#if factor > 1.0}
							(<span style="color: var(--ax-bg-danger-strong);">+{factor.toFixed(2)}%</span>)
						{:else}
							(<span style="color: var(--ax-text-success-subtle);"
								>-{(1.0 - factor).toFixed(2)}%</span
							>)
						{/if}
					{/if}
				</BodyShort>
			{/if}
		{:else}
			<BodyShort>No cost data available</BodyShort>
		{/each}

		<Link
			href="/team/{result.data.team.slug}/{result.data.team.environment.environment.name}/{result
				.data.team.environment.workload.__typename === 'Job'
				? 'job'
				: 'app'}/{result.data.team.environment.workload.name}/cost">View details</Link
		>
	{:else}
		No cost data available
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--ax-space-4);
	}

	.container {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}
</style>
