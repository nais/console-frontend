<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '#lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
	import { postgresInsightsSections } from '#lib/domain/postgres/insights.js';
	import PostgresBranchSelect from '#lib/domain/postgres/PostgresBranchSelect.svelte';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import {
		BodyShort,
		Heading,
		Loader,
		ToggleGroup,
		ToggleGroupItem
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	const uid = $props.id();

	let { data }: PageProps = $props();
	let { PostgresInsights, interval } = $derived(data);
	let selectedInterval = $derived(interval);
	let postgres = $derived($PostgresInsights.data?.team.environment.postgres);
	let branches = $derived.by(() => {
		const nodes = postgres?.branches.nodes ?? [];
		const active = postgres?.activeBranch;
		return active ? [active, ...nodes.filter((branch) => branch.id !== active.id)] : nodes;
	});
	let selectedBranch = $derived(page.url.searchParams.get('branch') ?? '');
	let branch = $derived(
		selectedBranch ? selectedBranch : (postgres?.activeBranch?.name ?? branches[0]?.name ?? '')
	);
	let sections = $derived(
		postgresInsightsSections(page.params.team!, page.params.postgres!, branch)
	);
</script>

<GraphErrors errors={$PostgresInsights.errors} />

{#if $PostgresInsights.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="insights-controls sticky top-0 z-100 p-2">
		<PostgresBranchSelect
			store={PostgresInsights}
			{branch}
			onchange={(value) => changeParams({ branch: value })}
		/>
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

	{#if branch}
		{#key `${page.params.team}/${page.params.env}/${page.params.postgres}/${branch}`}
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
	{:else}
		<section aria-labelledby={`${uid}-utilization-heading`}>
			<Heading as="h2" size="medium" spacing id={`${uid}-utilization-heading`}>Utilization</Heading>
			<BodyShort>Utilization is not yet available.</BodyShort>
		</section>
	{/if}
{/if}

<style>
	.insights-sections {
		display: grid;
		gap: var(--ax-space-32);
	}
	.insights-controls {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: var(--ax-space-16);
		margin-bottom: var(--ax-space-24);
	}
	.insights-controls > :global(:last-child) {
		margin-left: auto;
	}
</style>
