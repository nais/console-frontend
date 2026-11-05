<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import ChartBoundary from '#lib/chart/ChartBoundary.svelte';
	import CostAreaChart from '#lib/chart/CostAreaChart.svelte';
	import { getFromForCost, type CostInterval } from '#lib/domain/cost/dateUtils.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import SurfaceCard from '#lib/ui/SurfaceCard.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Detail, Loader, ToggleGroup, ToggleGroupItem } from '#lib/shadcn/ui/index.js';
	import { subDays } from 'date-fns';

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
	}

	let { environment, workload, teamSlug }: Props = $props();

	let interval = $state<CostInterval>('30d');

	const costQuery = graphql(`
		query CostOverview($workload: String!, $team: Slug!, $env: String!, $from: Date!, $to: Date!)
		@cache(policy: NetworkOnly) {
			team(slug: $team) @loading {
				environment(name: $env) @loading {
					environment @loading {
						name
					}
					workload(name: $workload) @loading {
						cost @loading {
							daily(from: $from, to: $to) @loading {
								series {
									date
									services {
										cost
										service
									}
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
		const to = subDays(new Date(), 2);
		const from = getFromForCost(interval, to);

		costQuery.fetch({
			variables: {
				team: teamSlug,
				env: environment,
				workload,
				from,
				to
			}
		});
	});

	function onIntervalChange(value: string) {
		interval = value as CostInterval;
		changeParams({ interval: value }, { noScroll: true });
	}

	let workloadData = $derived($costQuery?.data?.team?.environment?.workload);
	let envName = $derived($costQuery?.data?.team?.environment?.environment);
</script>

<SurfaceCard title="Cost" eyebrow={false}>
	{#snippet headerAside()}
		{#if workloadData?.cost?.daily !== PendingValue && workloadData?.cost?.daily && workloadData.cost.daily.series.length > 0}
			<ToggleGroup size="small" value={interval} onchange={onIntervalChange}>
				{#each ['30d', '90d', '6m', '1y'] as iv (iv)}
					<ToggleGroupItem value={iv}>{iv}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		{/if}
	{/snippet}
	<GraphErrors errors={$costQuery?.errors} />

	{#if $costQuery?.fetching && !$costQuery?.data}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{:else if workloadData}
		{#if workloadData.cost?.daily !== PendingValue && workloadData.cost?.daily}
			{#if workloadData.cost.daily.series.length === 0 && envName !== PendingValue && envName && envName.name.search(/-fss/i) > 0}
				<Detail>No cost data available for applications in {envName.name}.</Detail>
			{:else if workloadData.cost.daily.series.length > 0}
				<div class="chart">
					<ChartBoundary>
						<CostAreaChart
							data={workloadData.cost.daily.series.map((item) => {
								const ret: { date: Date; [key: string]: number | Date } = { date: item.date };
								item.services.forEach((service) => {
									ret[service.service] = service.cost;
								});
								return ret;
							})}
						/>
					</ChartBoundary>
				</div>
			{:else}
				<Detail>No cost data available</Detail>
			{/if}
		{:else}
			<div class="loading">
				<Loader size="3xlarge" />
			</div>
		{/if}
	{:else}
		<Detail>No cost data available</Detail>
	{/if}
</SurfaceCard>

<style>
	.chart {
		height: 350px;
		min-width: 0;
		margin-bottom: var(--ax-space-32);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		width: 100%;
	}
</style>
