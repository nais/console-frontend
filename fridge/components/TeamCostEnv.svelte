<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformColumnChartTeamCostEnv,
		type TeamCostEnvType
	} from '$lib/chart/cost_transformer';
	import { Skeleton } from '@nais/ds-svelte-community';
	import type { TeamCostEnvVariables } from '../../src/lib/components/$houdini';

	export const _TeamCostEnvVariables: TeamCostEnvVariables = () => {
		return { filter: { team: team, from: from, to: to } };
	};

	const costQuery = graphql(`
		query TeamCostEnv($filter: EnvCostFilter!) @load @cache(policy: NetworkOnly) {
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
		opts.legend = { ...opts.legend, bottom: 0 };
		return opts;
	}
	function calculateHeight(data: TeamCostEnvType) {
		return (data.apps.length / 10) * 20 + 385 + 'px';
	}
</script>

{#if $costQuery.errors}
	{#each $costQuery.errors as error}
		{error.message}
	{/each}
{/if}

{#if $costQuery.data !== null}
	{#each $costQuery.data.envCost as cost}
		<Card columns={12}>
			{#if cost === PendingValue}
				<Skeleton variant="rectangle" height="385px" />
			{:else if cost.apps.length > 0}
				<h4>Daily cost per app/job for {cost.env}</h4>
				<EChart options={echartOptionsColumnChart(cost)} style="height: {calculateHeight(cost)}" />
			{/if}
		</Card>
	{/each}
{/if}
