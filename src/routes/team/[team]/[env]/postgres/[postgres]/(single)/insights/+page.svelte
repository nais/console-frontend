<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '#lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '#lib/chart/util.js';
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
	let namespace = $derived(`namespace="${page.params.team}"`);
	let branch = $derived(postgres?.activeBranch?.name ?? '');
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
	let pvcPods = $derived(
		`kube_pod_spec_volumes_persistentvolumeclaims_info{${namespace},volume="pgdata"}`
	);
	let diskUsed = $derived(
		`sum by (namespace,pod,k8s_cluster_name) (kubelet_volume_stats_used_bytes{${namespace}} * on(namespace,persistentvolumeclaim,k8s_cluster_name) group_left(pod) ${pvcPods})`
	);
	let diskCapacity = $derived(
		`sum by (namespace,pod,k8s_cluster_name) (kubelet_volume_stats_capacity_bytes{${namespace}} * on(namespace,persistentvolumeclaim,k8s_cluster_name) group_left(pod) ${pvcPods})`
	);
	let diskQuery = $derived(
		`sum((${diskUsed}) * on(namespace,pod,k8s_cluster_name) group_left() ${selectedPods}) / clamp_min(sum((${diskCapacity}) * on(namespace,pod,k8s_cluster_name) group_left() ${selectedPods}), 1)`
	);

	const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
</script>

<GraphErrors errors={$PostgresInsights.errors} />

{#if $PostgresInsights.fetching && !postgres}
	<div class="loading-centered" role="status" aria-label="Loading">
		<Loader size="3xlarge" />
	</div>
{:else if postgres}
	<div class="sticky top-0 z-100 flex justify-end p-2">
		<ToggleGroup
			bind:value={selectedInterval}
			onchange={() => changeParams({ interval: selectedInterval })}
		>
			{#each Object.values(PrometheusChartQueryInterval) as option (option)}
				<ToggleGroupItem value={option}>{option}</ToggleGroupItem>
			{/each}
		</ToggleGroup>
	</div>

	<section aria-labelledby={`${uid}-utilization-heading`}>
		<Heading as="h2" size="medium" spacing id={`${uid}-utilization-heading`}>Utilization</Heading>
		{#if postgres.activeBranch}
			<PrometheusChart
				{interval}
				title="CPU utilization"
				description="CPU usage as a percentage of requested CPU for the active database."
				query={cpuQuery}
				environmentName={postgres.teamEnvironment.environment.name}
				labelFormatter={() => 'CPU used'}
				formatYValue={formatPercentage}
			/>
			<PrometheusChart
				{interval}
				title="Memory utilization"
				description="Memory working set as a percentage of requested memory for the active database."
				query={memoryQuery}
				environmentName={postgres.teamEnvironment.environment.name}
				labelFormatter={() => 'Memory used'}
				formatYValue={formatPercentage}
			/>
			<PrometheusChart
				{interval}
				title="Disk utilization"
				description="Storage used as a percentage of disk capacity for the active database."
				query={diskQuery}
				environmentName={postgres.teamEnvironment.environment.name}
				labelFormatter={() => 'Disk used'}
				formatYValue={formatPercentage}
			/>
		{:else}
			<BodyShort>Utilization is not yet available.</BodyShort>
		{/if}
	</section>
{/if}
