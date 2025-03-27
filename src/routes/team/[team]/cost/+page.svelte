<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import TeamCostEnv from '$lib/components/TeamCostEnv.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamCost, teamSlug, interval, from, to } = $derived(data);
</script>

<div class="wrapper">
	<GraphErrors errors={$TeamCost.errors} />

	{#if $TeamCost.data}
		<div class="graph">
			<div class="heading">
				<Heading level="2">Cost by Service</Heading>
				<ToggleGroup
					value={interval}
					onchange={(interval) => changeParams({ interval }, { noScroll: true })}
				>
					{#each ['12', '6', '3', '1'] as interval (interval)}
						<ToggleGroupItem value={interval}>{interval}m</ToggleGroupItem>
					{/each}
				</ToggleGroup>
			</div>
			<EChart
				options={costTransformStackedColumnChart(from, to, $TeamCost.data.team.cost.daily)}
				style="height: 500px"
			/>
		</div>

		<TeamCostEnv team={teamSlug} {from} {to} />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}

	.graph {
		display: flex;
		flex-direction: column;
		gap: var(--a-spacing-4);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
</style>
