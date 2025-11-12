<script lang="ts">
	import { graphql } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { BodyShort, Heading, HelpText, Link } from '@nais/ds-svelte-community';

	const costQuery = graphql(`
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

	$effect.pre(() => {
		costQuery.fetch({
			variables: {
				team: teamSlug,
				environment: environment,
				workload: workload
			}
		});
	});

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();

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
		<Heading level="3" size="small">Cost</Heading>
		<HelpText title="Aggregated workload cost"
			>Aggregated cost for workload. Current month is estimated.</HelpText
		>
	</div>

	<GraphErrors errors={$costQuery.errors} />

	{#if $costQuery.data}
		{@const cost = $costQuery.data.team.environment.workload.cost}
		{@const factor = getFactor(cost.monthly.series)}

		{#each cost.monthly.series.slice(0, 2) as item (item)}
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
					{#if cost.monthly.series.length > 1}
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
			href="/team/{$costQuery.data.team.slug}/{$costQuery.data.team.environment.environment
				.name}/{$costQuery.data.team.environment.workload.__typename === 'Job'
				? 'job'
				: 'app'}/{$costQuery.data.team.environment.workload.name}/cost">View details</Link
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
