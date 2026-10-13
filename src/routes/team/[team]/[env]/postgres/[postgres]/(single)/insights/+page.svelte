<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '#lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
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
	let namespace = $derived(`namespace="${page.params.team}"`);
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
	let selectedPods = $derived(
		`max by (namespace,pod,k8s_cluster_name) (up{${namespace},team="${page.params.team}",postgres="${page.params.postgres}",branch="${branch}"} == 1)`
	);
	let cpuUsage = $derived(
		`sum by (namespace,pod,k8s_cluster_name) (rate(container_cpu_usage_seconds_total{${namespace},container="postgres",image!=""}[$__rate_interval]))`
	);
	let cpuRequested = $derived(
		`sum by (namespace,pod,k8s_cluster_name) (kube_pod_container_resource_requests{${namespace},container="postgres",resource="cpu",unit="core"})`
	);
	let cpuQuery = $derived(
		`sum((${cpuUsage}) * on(namespace,pod,k8s_cluster_name) group_left() ${selectedPods}) / clamp_min(sum((${cpuRequested}) * on(namespace,pod,k8s_cluster_name) group_left() ${selectedPods}), 0.001)`
	);
	let memoryUsage = $derived(
		`sum by (namespace,pod,k8s_cluster_name) (container_memory_working_set_bytes{${namespace},container="postgres",image!=""})`
	);
	let memoryRequested = $derived(
		`sum by (namespace,pod,k8s_cluster_name) (kube_pod_container_resource_requests{${namespace},container="postgres",resource="memory",unit="byte"})`
	);
	let memoryQuery = $derived(
		`sum((${memoryUsage}) * on(namespace,pod,k8s_cluster_name) group_left() ${selectedPods}) / clamp_min(sum((${memoryRequested}) * on(namespace,pod,k8s_cluster_name) group_left() ${selectedPods}), 1)`
	);
	let branchPvcs = $derived(
		`max by (namespace,persistentvolumeclaim,k8s_cluster_name) (kube_pod_spec_volumes_persistentvolumeclaims_info{${namespace},volume="pgdata"} and on(namespace,pod,k8s_cluster_name) (${selectedPods}))`
	);
	let diskUsed = $derived(
		`max by (namespace,persistentvolumeclaim,k8s_cluster_name) (kubelet_volume_stats_used_bytes{${namespace}}) and on(namespace,persistentvolumeclaim,k8s_cluster_name) (${branchPvcs})`
	);
	let diskCapacity = $derived(
		`max by (namespace,persistentvolumeclaim,k8s_cluster_name) (kubelet_volume_stats_capacity_bytes{${namespace}}) and on(namespace,persistentvolumeclaim,k8s_cluster_name) (${branchPvcs})`
	);
	let diskQuery = $derived(`sum(${diskUsed}) / clamp_min(sum(${diskCapacity}), 1)`);

	const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
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

	<section aria-labelledby={`${uid}-utilization-heading`}>
		<Heading as="h2" size="medium" spacing id={`${uid}-utilization-heading`}>Utilization</Heading>
		{#if branch}
			{#key branch}
				<PrometheusChart
					{interval}
					title="CPU utilization"
					description={`CPU usage as a percentage of requested CPU for branch ${branch}.`}
					query={cpuQuery}
					environmentName={postgres.teamEnvironment.environment.name}
					labelFormatter={() => 'CPU used'}
					formatYValue={formatPercentage}
				/>
				<PrometheusChart
					{interval}
					title="Memory utilization"
					description={`Memory working set as a percentage of requested memory for branch ${branch}.`}
					query={memoryQuery}
					environmentName={postgres.teamEnvironment.environment.name}
					labelFormatter={() => 'Memory used'}
					formatYValue={formatPercentage}
				/>
				<PrometheusChart
					{interval}
					title="Disk utilization"
					description={`Storage used as a percentage of disk capacity for branch ${branch}.`}
					query={diskQuery}
					environmentName={postgres.teamEnvironment.environment.name}
					labelFormatter={() => 'Disk used'}
					formatYValue={formatPercentage}
				/>
			{/key}
		{:else}
			<BodyShort>Utilization is not yet available.</BodyShort>
		{/if}
	</section>
{/if}

<style>
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
