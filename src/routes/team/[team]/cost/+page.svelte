<script lang="ts">
	import { PendingValue } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import { changeParams } from '$lib/utils/searchparams';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import TeamEnvironmentApplicationsCost from './TeamEnvironmentApplicationsCost.svelte';

	const { data }: PageProps = $props();
	const { TeamCost, interval, teamSlug, from, to } = $derived(data);
</script>

<div class="wrapper">
	<GraphErrors errors={$TeamCost.errors} />

	<div class="graph">
		<div class="heading">
			<Heading level="2">Cost by Service</Heading>
			<ToggleGroup
				value={interval}
				onchange={(interval) => changeParams({ interval }, { noScroll: true })}
			>
				{#each ['30d', '90d', '6m', '1y'] as interval (interval)}
					<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		</div>
		{#if $TeamCost.data && $TeamCost.data.team.cost !== PendingValue}
			<EChart
				options={costTransformStackedColumnChart(from, to, $TeamCost.data.team.cost.daily)}
				style="height: 500px"
			/>
		{:else}
			<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
				<Loader size="3xlarge" />
			</div>
		{/if}
	</div>

	<TeamEnvironmentApplicationsCost {teamSlug} {from} {to} {interval} />
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
