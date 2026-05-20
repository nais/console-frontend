<script lang="ts">
	import { PendingValue } from '$houdini';
	import CostAreaChart from '$lib/chart/CostAreaChart.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		BodyLong,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';
	import TeamEnvironmentApplicationsCost from './TeamEnvironmentApplicationsCost.svelte';

	const { data }: PageProps = $props();
	const { TeamCost, interval, teamSlug, from, to } = $derived(data);
</script>

<GraphErrors errors={$TeamCost.errors} />

<div class="content">
	<section aria-labelledby="cost-by-service-heading">
		<div class="section-header">
			<Heading as="h2" id="cost-by-service-heading" size="medium">Cost by Service</Heading>
			<ToggleGroup
				size="small"
				value={interval}
				onchange={(interval) => changeParams({ interval }, { noScroll: true })}
			>
				{#each ['30d', '90d', '6m', '1y'] as interval (interval)}
					<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
				{/each}
			</ToggleGroup>
		</div>

		<BodyLong>
			Distribution of team costs across various services. Cost information is best-effort and
			originates from Google Cloud and Aiven.
		</BodyLong>

		{#if $TeamCost.data && $TeamCost.data.team.cost !== PendingValue}
			<div class="chart">
				<CostAreaChart
					data={$TeamCost.data.team.cost.daily.series.map((item) => {
						const ret: { date: Date; [key: string]: number | Date } = { date: item.date };
						item.services.forEach((service) => {
							ret[service.service] = service.cost;
						});
						return ret;
					})}
				/>
			</div>
		{:else}
			<div class="loading" role="status" aria-label="Loading">
				<Loader size="3xlarge" />
			</div>
		{/if}
	</section>

	<TeamEnvironmentApplicationsCost {teamSlug} {from} {to} {interval} />
</div>

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--ax-space-8);
		margin-bottom: var(--ax-space-16);
	}

	.chart {
		height: 350px;
		min-width: 0;
		padding-inline: var(--spacing-layout);
	}

	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 300px;
	}
</style>
