<script lang="ts">
	import { PendingValue } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import TeamEnvironmentApplicationsCost from './TeamEnvironmentApplicationsCost.svelte';

	const { data }: PageProps = $props();
	const { TeamCost, interval, teamSlug, from, to } = $derived(data);
</script>

<div class="wrapper">
	<GraphErrors errors={$TeamCost.errors} />

	<div class="graph">
		<div class="heading">
			<div class="content">
				<Heading level="2" spacing>Cost by Service</Heading>
				<BodyLong>
					Distribution of team costs across various services. Some services, like Kafka, are missing
					cost data per team. Cost information is best-effort and originates from Google Cloud and
					Aiven.
				</BodyLong>
			</div>
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
		align-items: flex-end;
		gap: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
</style>
