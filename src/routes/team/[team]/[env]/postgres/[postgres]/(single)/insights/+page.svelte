<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '#lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
	import { postgresInsightsSections } from '#lib/domain/postgres/insights.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import { Heading, Loader, ToggleGroup, ToggleGroupItem } from '#lib/shadcn/ui/index.js';
	import type { PageProps } from './$types';

	const uid = $props.id();

	let { data }: PageProps = $props();
	let { PostgresInsights, interval } = $derived(data);
	let selectedInterval = $derived(interval);
	let postgres = $derived($PostgresInsights.data?.team.environment.postgres);
	let sections = $derived(postgresInsightsSections(page.params.team!, page.params.postgres!));
</script>

<GraphErrors errors={$PostgresInsights.errors} />

{#if $PostgresInsights.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="insights-controls sticky top-0 z-100 p-2">
		<ToggleGroup
			label="Time period"
			size="small"
			bind:value={selectedInterval}
			onchange={() => changeParams({ interval: selectedInterval })}
		>
			{#each Object.values(PrometheusChartQueryInterval) as option (option)}
				<ToggleGroupItem value={option}>{option}</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>

	{#key `${page.params.team}/${page.params.env}/${page.params.postgres}`}
		<div class="insights-sections">
			{#each sections as section (section.id)}
				<section aria-labelledby={`${uid}-${section.id}-heading`}>
					<Heading as="h2" size="medium" spacing id={`${uid}-${section.id}-heading`}>
						{section.title}
					</Heading>
					{#each section.charts as chart (chart.title)}
						<PrometheusChart
							{interval}
							{...chart}
							environmentName={postgres.teamEnvironment.environment.name}
						/>
					{/each}
				</section>
			{/each}
		</div>
	{/key}
{/if}

<style>
	.insights-sections {
		display: grid;
		gap: var(--nais-space-32);
	}
	.insights-controls {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--nais-space-16);
		margin-bottom: var(--nais-space-24);
	}
	.insights-controls > :global(:last-child) {
		margin-left: auto;
	}
</style>
