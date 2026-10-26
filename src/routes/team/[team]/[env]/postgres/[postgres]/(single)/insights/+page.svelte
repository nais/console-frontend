<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '#lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
	import { postgresInsightsSections } from '#lib/domain/postgres/insights.js';
	import GraphErrors from '#lib/ui/GraphErrors.svelte';
	import { changeParams } from '#lib/utils/searchparams.js';
	import {
		Alert,
		BodyShort,
		Button,
		Heading,
		Loader,
		Select,
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
	let selectedBranch = $state('');
	let branch = $derived(
		branches.some((candidate) => candidate.name === selectedBranch)
			? selectedBranch
			: (postgres?.activeBranch?.name ?? branches[0]?.name ?? '')
	);
	let loadingBranches = $state(false);
	let branchLoadError = $state('');

	async function loadMoreBranches() {
		loadingBranches = true;
		branchLoadError = '';
		try {
			await PostgresInsights.loadNextPage({ first: 20 });
		} catch (error) {
			branchLoadError =
				error instanceof Error ? error.message : 'Could not load more branches. Please try again.';
		} finally {
			loadingBranches = false;
		}
	}
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
		{#if postgres.branches.pageInfo.totalCount > 1}
			<div class="branch-selector">
				<Select
					label="Branch"
					size="small"
					value={branch}
					onchange={(event) => (selectedBranch = event.currentTarget.value)}
				>
					{#each branches as candidate (candidate.id)}
						<option value={candidate.name}>
							{candidate.name}{candidate.id === postgres.activeBranch?.id ? ' (active)' : ''}
						</option>
					{/each}
				</Select>
				{#if postgres.branches.pageInfo.hasNextPage}
					<Button
						size="small"
						variant="tertiary"
						loading={loadingBranches}
						onclick={loadMoreBranches}
					>
						Load more branches
					</Button>
				{/if}
			</div>
		{/if}
		<ToggleGroup
			bind:value={selectedInterval}
			onchange={() => changeParams({ interval: selectedInterval })}
		>
			{#each Object.values(PrometheusChartQueryInterval) as option (option)}
				<ToggleGroupItem value={option}>{option}</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>
	{#if branchLoadError}<Alert variant="error" size="small">{branchLoadError}</Alert>{/if}

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
	.branch-selector {
		display: flex;
		align-items: flex-end;
		flex-wrap: wrap;
		gap: var(--ax-space-8);
	}
</style>
