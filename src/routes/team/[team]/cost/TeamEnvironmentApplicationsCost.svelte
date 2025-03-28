<script lang="ts">
	import { graphql } from '$houdini';
	import { costTransformColumnChartTeamEnvironmentApplicationsCost } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { TeamEnvironmentApplicationsCostVariables } from './$houdini';

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

	export const _TeamEnvironmentApplicationsCostVariables: TeamEnvironmentApplicationsCostVariables =
		() => {
			return { teamSlug, to, from };
		};

	const costQuery = graphql(`
		query TeamEnvironmentApplicationsCost($teamSlug: Slug!, $from: Date!, $to: Date!) @load {
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

	const appsByEnv = $derived(
		$costQuery.data?.team.environments
			.filter((env) => env.cost.daily.series.length > 0)
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
							.filter(([, cost]) => cost !== undefined)
					}))
			}))
			.toReversed() ?? []
	);
</script>

<Heading level="2">Cost by Environment</Heading>
{#if $costQuery.fetching}
	<div style="display: flex; justify-content: center; align-items: center; height: 200px;">
		<Loader size="3xlarge" />
	</div>
{:else}
	{#each appsByEnv as env (env.id)}
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
	{/each}
{/if}

<style>
	.heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
