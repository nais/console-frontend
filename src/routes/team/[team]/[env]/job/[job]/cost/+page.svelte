<script lang="ts">
	import { PendingValue } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import CostAreaChart from '$lib/chart/CostAreaChart.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

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
						Distribution of job costs across various services. Cost information is best-effort and
						originates from Google Cloud and Aiven.
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
				<div class="h-[500px]">
					<CostAreaChart
						data={$JobCost.data.team.environment.job.cost.daily.series.map((item) => {
							const ret: { date: Date; [key: string]: number | Date } = { date: item.date };
							item.services.forEach((service) => {
								ret[service.service] = service.cost;
							});
							return ret;
						})}
					/>
				</div>
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
