<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import CostAreaChart from '$lib/chart/CostAreaChart.svelte';
	import { serviceColor } from '$lib/chart/util';
	import { getFromForCost, type CostInterval } from '$lib/domain/cost/dateUtils';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Detail, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import { subDays } from 'date-fns';

	interface Props {
		environment: string;
		workload: string;
		teamSlug: string;
		workloadType?: 'app' | 'job';
	}

	let { environment, workload, teamSlug, workloadType = 'app' }: Props = $props();

	let interval = $state<CostInterval>('30d');

	const appCostQuery = graphql(`
		query CostOverview($app: String!, $team: Slug!, $env: String!, $from: Date!, $to: Date!)
		@cache(policy: NetworkOnly) {
			team(slug: $team) @loading {
				environment(name: $env) @loading {
					environment @loading {
						name
					}
					application(name: $app) @loading {
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

	const jobCostQuery = graphql(`
		query CostOverviewJob($job: String!, $team: Slug!, $env: String!, $from: Date!, $to: Date!)
		@cache(policy: NetworkOnly) {
			team(slug: $team) @loading {
				environment(name: $env) @loading {
					environment @loading {
						name
					}
					job(name: $job) @loading {
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

		const variables = {
			team: teamSlug,
			env: environment,
			from,
			to
		};

		if (workloadType === 'job') {
			jobCostQuery.fetch({ variables: { ...variables, job: workload } });
		} else {
			appCostQuery.fetch({ variables: { ...variables, app: workload } });
		}
	});

	function onIntervalChange(value: string) {
		interval = value as CostInterval;
		changeParams({ interval: value }, { noScroll: true });
	}

	let costQuery = $derived(workloadType === 'job' ? $jobCostQuery : $appCostQuery);
	let workloadData = $derived(
		workloadType === 'job'
			? $jobCostQuery.data?.team?.environment?.job
			: $appCostQuery.data?.team?.environment?.application
	);
	let envName = $derived(costQuery.data?.team?.environment?.environment);

	let services = $derived.by(() => {
		const daily = workloadData?.cost?.daily;
		if (!daily || daily === PendingValue) return [];
		const names: string[] = [];
		for (const item of daily.series) {
			for (const s of item.services) {
				if (!names.includes(s.service)) {
					names.push(s.service);
				}
			}
		}
		return names;
	});
</script>

<SurfaceCard title="Cost" reverseGradient>
	{#snippet headerAside()}
		{#if workloadData?.cost?.daily !== PendingValue && workloadData?.cost?.daily && workloadData.cost.daily.series.length > 0}
			<ToggleGroup size="small" value={interval} onchange={onIntervalChange}>
				{#each ['30d', '90d', '6m', '1y'] as iv (iv)}
					<ToggleGroupItem value={iv}>{iv}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		{/if}
	{/snippet}

	<GraphErrors errors={costQuery.errors} />

	{#if costQuery.fetching && !costQuery.data}
		<div class="loading">
			<Loader size="3xlarge" />
		</div>
	{:else if workloadData}
		{#if workloadData.cost?.daily !== PendingValue && workloadData.cost?.daily}
			{#if workloadData.cost.daily.series.length === 0 && envName !== PendingValue && envName && envName.name.search(/-fss/i) > 0}
				<Detail>No cost data available for applications in {envName.name}.</Detail>
			{:else if workloadData.cost.daily.series.length > 0}
				{#if services.length > 1}
					<div class="legend">
						{#each services as name (name)}
							<div class="legend-item">
								<span class="legend-swatch" style="background-color: {serviceColor(name)}"></span>
								<span class="legend-label">{name}</span>
							</div>
						{/each}
					</div>
				{/if}
				<div class="chart">
					<CostAreaChart
						data={workloadData.cost.daily.series.map((item) => {
							const ret: { date: Date; [key: string]: number | Date } = { date: item.date };
							item.services.forEach((service) => {
								ret[service.service] = service.cost;
							});
							return ret;
						})}
					/>
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

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--ax-space-8) var(--ax-space-16);
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
	}

	.legend-swatch {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.legend-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-subtle);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 200px;
		width: 100%;
	}
</style>
