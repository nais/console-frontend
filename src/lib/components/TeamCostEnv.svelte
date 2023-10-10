<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformColumnChartTeamCostEnv,
		type TeamCostEnvType
	} from '$lib/chart/cost_transformer';
	import type { TeamCostEnvVariables } from './$houdini';

	export const _TeamCostEnvVariables: TeamCostEnvVariables = () => {
		return { filter: { team: team, from: from, to: to } };
	};

	const costQuery = graphql(`
		query TeamCostEnv($filter: EnvCostFilter!) @load {
			envCost(filter: $filter) @loading {
				env
				apps {
					app
					sum
					cost {
						date
						cost
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
		opts.legend = { bottom: 0 };
		return opts;
	}
	function calculateHeight(data: TeamCostEnvType) {
		return (data.apps.length / 10) * 16 + 385 + 'px';
	}
</script>

{#if $costQuery.errors}
	{#each $costQuery.errors as error}
		{error.message}
	{/each}
{/if}

{#if $costQuery.data !== null}
	{#each $costQuery.data.envCost as cost}
		{#if cost === PendingValue}
			<Loading />
		{:else if cost.apps.length > 0}
			<Card columns={12}>
				<h4>Daily cost per app/job for {cost.env}</h4>
				<EChart options={echartOptionsColumnChart(cost)} style="height: {calculateHeight(cost)}" />
			</Card>
		{/if}
	{/each}
{/if}
