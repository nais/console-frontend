<script lang="ts">
	import { PendingValue } from '$houdini';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import CostAreaChart from '$lib/chart/CostAreaChart.svelte';
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

<div class="wrapper">
	<GraphErrors errors={$TeamCost.errors} />

	<div class="graph">
		<div class="heading">
			<div class="content">
				<Heading level="2" spacing>Cost by Service</Heading>
				<BodyLong>
					Distribution of team costs across various services. Cost information is best-effort and
					originates from Google Cloud and Aiven. For Kafka we are using a shared base cost for
					every team, plus the total size of the Kafka topics in the team.
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
			<div class="mt-4 h-[500px]">
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
		gap: var(--ax-space-16);
	}

	.heading {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: var(--spacing-layout);
		padding-bottom: var(--spacing-layout);
	}

	.content {
		max-width: 80ch;
	}
</style>
