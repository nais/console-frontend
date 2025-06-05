<script lang="ts">
	import { PendingValue } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	const { data }: PageProps = $props();
	const { JobCost, interval } = $derived(data);
</script>

<GraphErrors errors={$JobCost.errors} />

<div class="wrapper">
	{#if $JobCost.data}
		<div class="graph">
			<div class="heading">
				<div class="content">
					<BodyLong>
						Distribution of job costs across various services. Some services, like Kafka, are
						missing cost data. Cost information is best-effort and originates from Google Cloud and
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
			{#if $JobCost.data && $JobCost.data.team.environment.job.cost.daily !== PendingValue}
				{@const d = $JobCost.data.team.environment.job.cost.daily}
				<EChart options={costTransformStackedColumnChart(d)} style="height: 400px" />
			{:else}
				<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
					<Loader size="3xlarge" />
				</div>
			{/if}
		</div>
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
		gap: var(--ax-space-16);
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
