<script lang="ts">
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import {
		costTransformColumnChartTeamCostEnv,
		type TeamCostEnvType
	} from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import type { TeamCostEnvVariables } from './$houdini';

	export const _TeamCostEnvVariables: TeamCostEnvVariables = () => {
		return { team: team, from: from, to: to };
	};

	const costQuery = graphql(`
		query TeamCostEnv($team: Slug!, $from: Date!, $to: Date!) @load @cache(policy: NetworkOnly) {
			team(slug: $team) {
				environments {
					name
					cost {
						daily(from: $from, to: $to) {
							sum
							series {
								date
								sum
								workloads {
									cost
									workloadName
								}
							}
						}
					}
				}
			}
		}
	`);

	export let from: Date;
	export let to: Date;
	export let team: string;

	function echartOptionsColumnChart(data: TeamCostEnvType) {
		const opts = costTransformColumnChartTeamCostEnv(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 0 };
		return opts;
	}
	function calculateHeight(data: TeamCostEnvType) {
		const uniqueWorkloads = new Set();
		data.forEach((e) => {
			e.workloads.forEach((w) => {
				uniqueWorkloads.add(w.workloadName);
			});
		});

		return `${(uniqueWorkloads.size / 10) * 20 + 385}px`;
	}
</script>

{#if $costQuery.errors}
	{#each $costQuery.errors as error}
		{error.message}
	{/each}
{/if}

{#if $costQuery.data !== null}
	{#each $costQuery.data.team.environments as environment}
		<Card columns={12}>
			{#if environment.cost.daily.series[0].workloads.length > 0}
				<h4>Daily cost per app/job for {environment.name}</h4>
				<EChart
					options={echartOptionsColumnChart(environment.cost.daily.series)}
					style="height: {calculateHeight(environment.cost.daily.series)}"
				/>
			{/if}
		</Card>
	{/each}
{/if}
