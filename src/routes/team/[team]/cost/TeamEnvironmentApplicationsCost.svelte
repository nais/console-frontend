<script lang="ts">
	import { graphql } from '$houdini';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import { euroAxisFormatter } from '$lib/chart/util';
	import { changeParams } from '$lib/utils/searchparams';
	import { visualizationColors } from '$lib/visualizationColors';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import { LineChart } from 'layerchart';

	const {
		teamSlug,
		from,
		to,
		interval
	}: {
		teamSlug: string;
		from: Date;
		to: Date;
		interval: string;
	} = $props();

	const costQuery = graphql(`
		query TeamEnvironmentApplicationsCost($teamSlug: Slug!, $from: Date!, $to: Date!) {
			team(slug: $teamSlug) {
				environments {
					id
					environment {
						name
					}
					cost {
						daily(from: $from, to: $to) {
							series {
								date
								workloads {
									cost
									workload {
										name
										__typename
									}
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
				teamSlug,
				from,
				to
			}
		});
	});

	const appsByEnv = $derived(
		$costQuery.data?.team.environments
			.filter((env) => env?.cost.daily.series.length > 0)
			.map((env) => ({
				...env,
				series: env.cost.daily.series
					.flatMap((s) =>
						s.workloads
							.filter((w) => w.workload?.__typename === 'Application')
							.map((w) => w.workload?.name)
					)
					.filter((e, i, a) => a.indexOf(e) === i)
					.map((name) => ({
						name,
						data: env.cost.daily.series
							.map((s) => [
								s.date.getTime(),
								s.workloads.find((w) => w.workload?.name === name)?.cost
							])
							.filter(([, cost]) => cost !== undefined),
						sum: env.cost.daily.series
							.map((s) => s.workloads.find((w) => w.workload?.name === name)?.cost)
							.filter((cost) => cost !== undefined)
							.reduce((acc, cost) => acc + (cost ?? 0), 0)
					}))
					.sort((a, b) => b.sum - a.sum)
					.slice(0, 10)
			}))
			.toReversed() ?? []
	);
</script>

<div>
	<div class="content">
		<Heading as="h2" spacing>10 Most Expensive Applications by Environment</Heading>
		<BodyLong spacing>
			Accumulated cost for each application over time, including persistence, broken down by
			environment. Displaying the 10 most expensive applications for the chosen time interval.
		</BodyLong>
	</div>
	{#if $costQuery.fetching}
		<div style="display: flex; justify-content: center; align-items: center; height: 200px;">
			<Loader size="3xlarge" />
		</div>
	{:else}
		{#each appsByEnv as env (env.id)}
			<div class="heading">
				<Heading as="h3" size="small">{env.environment.name}</Heading>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['30d', '90d', '6m', '1y'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>

			{#if env.series.length > 0}
				<div class="mt-5 mb-12">
					<LegendWrapper height="500px">
						<LineChart
							padding={{ left: 40 }}
							legend={legendSnippet}
							series={env.series.map((item, i) => {
								return {
									key: item.name!,
									color: visualizationColors[i % visualizationColors.length],
									data: item.data.map(([date, value]) => ({
										date: new Date(date as number),
										value
									}))
								};
							})}
							x="date"
							y="value"
							props={{
								spline: {
									class: 'stroke-2'
								},
								yAxis: {
									format: euroAxisFormatter
								},
								xAxis: {
									format: 'day'
								}
							}}
						/>
					</LegendWrapper>
				</div>
			{:else}
				<BodyLong>No application cost data available</BodyLong>
			{/if}
		{/each}
	{/if}
</div>

<style>
	.heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: var(--spacing-layout);
	}
	.content {
		max-width: 80ch;
	}
</style>
