<script lang="ts">
	import { graphql } from '$houdini';
	import { costTransformColumnChartTeamEnvironmentApplicationsCost } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';

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

	$effect.pre(() => {
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
		<Heading level="2" spacing>10 Most Expensive Applications by Environment</Heading>
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
			{#if env.series.length > 0}
				<div class="heading">
					<Heading level="3" size="small">{env.environment.name}</Heading>
					<ToggleGroup
						value={interval}
						onchange={(interval) => changeParams({ interval }, { noScroll: true })}
					>
						{#each ['30d', '90d', '6m', '1y'] as interval (interval)}
							<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
						{/each}
					</ToggleGroup>
				</div>

				<EChart
					options={costTransformColumnChartTeamEnvironmentApplicationsCost(env.series)}
					style="height: 500px"
				/>
			{/if}
		{:else}
			<BodyLong>No application cost data available</BodyLong>
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
