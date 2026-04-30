<script lang="ts">
	import { graphql } from '$houdini';
	import CostChart from '$lib/chart/CostChart.svelte';
	import { prepareMonthlyCostSeries } from '$lib/domain/cost/cost';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { Detail, Heading, Link, Loader } from '@nais/ds-svelte-community';

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

	$effect(() => {
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

	let data = $derived.by(() => {
		return prepareMonthlyCostSeries($costQuery.data?.team.environment.workload.cost.monthly.series);
	});

	let detailsHref = $derived.by(() => {
		const team = $costQuery.data?.team;
		const environmentName = team?.environment.environment.name;
		const workloadData = team?.environment.workload;

		if (!team || !environmentName || !workloadData) {
			return undefined;
		}

		const workloadPath = workloadData.__typename === 'Job' ? 'job' : 'app';
		return `/team/${team.slug}/${environmentName}/${workloadPath}/${workloadData.name}/cost`;
	});
</script>

<div class="wrapper">
	<div class="container">
		<Heading as="h3" size="small">Cost</Heading>
	</div>

	<GraphErrors errors={$costQuery.errors} />

	{#if $costQuery.fetching || (!$costQuery.data && !$costQuery.errors?.length)}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{:else if $costQuery.data}
		{#if data.length}
			<CostChart {data} dateField="date" valueField="sum" class="mt-3 mb-5 h-45 w-[93%] pl-[7%]" />
		{:else}
			<Detail>No cost data available</Detail>
		{/if}

		{#if detailsHref}
			<Link href={detailsHref}>View details</Link>
		{/if}
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

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		width: 100%;
	}
</style>
