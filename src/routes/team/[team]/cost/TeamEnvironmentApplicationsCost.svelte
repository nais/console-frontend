<script lang="ts">
	import { graphql } from '$houdini';
	import LegendWrapper, { legendSnippet } from '$lib/chart/LegendWrapper.svelte';
	import { euroAxisFormatter } from '$lib/chart/util';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
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
			.filter((env) => env.series.length > 0)
			.toReversed() ?? []
	);
</script>

<section aria-labelledby="top-apps-heading">
	<div class="section-header">
		<Heading as="h2" id="top-apps-heading" size="medium">Top 10 Applications by Environment</Heading
		>
		<ToggleGroup
			size="small"
			value={interval}
			onchange={(interval) => changeParams({ interval }, { noScroll: true })}
		>
			{#each ['30d', '90d', '6m', '1y'] as interval (interval)}
				<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>

	<BodyLong>
		Accumulated cost for each application over time, including persistence. Displaying the 10 most
		expensive applications per environment.
	</BodyLong>

	<GraphErrors errors={$costQuery.errors} />

	{#if $costQuery.fetching}
		<div class="loading-centered" role="status" aria-label="Loading">
			<Loader size="3xlarge" />
		</div>
	{:else}
		{#each appsByEnv as env (env.id)}
			<div class="env-section">
				<Heading as="h3" size="small">{env.environment.name}</Heading>
				<div class="chart">
					<LegendWrapper height="400px">
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
			</div>
		{/each}
	{/if}
</section>

<style>
	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-16);
	}

	.env-section {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}

	.env-section:first-child {
		margin-top: var(--ax-space-24);
	}

	.env-section + .env-section {
		margin-top: var(--ax-space-64);
	}

	.chart {
		height: 400px;
		min-width: 0;
		padding-inline: var(--spacing-layout);
	}
</style>
