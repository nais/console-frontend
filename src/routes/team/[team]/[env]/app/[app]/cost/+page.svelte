<script lang="ts">
	import { PendingValue } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import { changeParams } from '$lib/utils/searchparams';
	import { BodyLong, Loader, ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	const { data }: PageProps = $props();
	const { AppCost, interval, from, to } = $derived(data);
</script>

<GraphErrors errors={$AppCost.errors} />

<div class="wrapper">
	{#if $AppCost.data}
		<div class="graph">
			<div class="heading">
				<div class="content">
					<BodyLong>
						Distribution of application costs across various services. Some services, like Kafka,
						are missing cost data. Cost information is best-effort and originates from Google Cloud
						and Aiven.
					</BodyLong>
				</div>
			</div>
			{#if $AppCost.data && $AppCost.data.team.environment.application.cost.daily !== PendingValue}
				{#if $AppCost.data.team.environment.application.cost.daily.series.length === 0 && $AppCost.data.team.environment.environment !== PendingValue && $AppCost.data.team.environment.environment.name.search(/-fss/i) > 0}
					<BodyLong spacing
						>No cost data available for applications in {$AppCost.data.team.environment.environment
							.name}.</BodyLong
					>
				{:else}
					{@const d = $AppCost.data.team.environment.application.cost.daily}
					<div class="toggles">
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
						options={costTransformStackedColumnChart(new Date(from), new Date(to), d)}
						style="height: 400px"
					/>
				{/if}
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
		gap: var(--ax-space-16, --a-spacing-4);
	}

	.heading {
		display: flex;
		align-items: flex-end;
		gap: var(--spacing-layout);
	}
	.toggles {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
</style>
