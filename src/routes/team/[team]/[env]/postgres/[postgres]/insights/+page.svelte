<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '$lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '$lib/chart/util';
	import { sanitizePromLabel } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import { ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { interval } = $derived(data);

	const teamSlug = $derived(sanitizePromLabel(page.params.team!));
	const name = $derived(sanitizePromLabel(page.params.postgres!));
	const envName = $derived(page.params.env!);

	const formatPercentage = (value: number) => {
		if (value % 1 !== 0) {
			return value.toFixed(2) + '%';
		}
		return value.toString() + '%';
	};
</script>

<div class="flex justify-end sticky top-0 z-100 p-2">
	<ToggleGroup
		bind:value={interval}
		onchange={() => {
			changeParams({ interval });
		}}
	>
		{#each Object.values(PrometheusChartQueryInterval) as interval (interval)}
			<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
		{/each}
	</ToggleGroup>
</div>

<PrometheusChart
	{interval}
	title="CPU utilization"
	description="CPU usage as a percentage of the requested CPU, per pod."
	query={`100 * (
  sum by (namespace, pod) (
    rate(container_cpu_usage_seconds_total{
      namespace="pg-${teamSlug}",
      pod=~"${name}-[0-9]+",
      container="postgres",
      image!=""
    }[5m])
  )
)
/
clamp_min(
  sum by (namespace, pod) (
    kube_pod_container_resource_requests{
      namespace="pg-${teamSlug}",
      pod=~"${name}-[0-9]+",
      container="postgres",
      resource="cpu",
      unit="core"
    }
  ),
  0.001
)
`}
	environmentName={envName}
	height="300px"
	labelFormatter={(labels) => {
		const pod = labels.find((l) => l.name === 'pod')?.value;
		return `CPU utilization${pod ? ` (${pod})` : ''}`;
	}}
	formatYValue={formatPercentage}
/>

<PrometheusChart
	{interval}
	title="Memory utilization"
	description="Working set memory as a percentage of the requested memory, per pod."
	query={`100 *
(
  sum by (namespace, pod) (
    container_memory_working_set_bytes{
      namespace="pg-${teamSlug}",
      pod=~"${name}-[0-9]+",
      container="postgres",
      image!=""
    }
  )
)
/
clamp_min(
  sum by (namespace, pod) (
    kube_pod_container_resource_requests{
      namespace="pg-${teamSlug}",
      pod=~"${name}-[0-9]+",
      container="postgres",
      resource="memory",
      unit="byte"
    }
  ),
  1
)
`}
	environmentName={envName}
	height="300px"
	labelFormatter={(labels) => {
		const pod = labels.find((l) => l.name === 'pod')?.value;
		return `Memory utilization${pod ? ` (${pod})` : ''}`;
	}}
	formatYValue={formatPercentage}
/>

<PrometheusChart
	{interval}
	title="Disk utilization"
	description="Used disk space as a percentage of volume capacity, per pod."
	query={`100 *
(
  sum by (namespace, pod) (
    kubelet_volume_stats_used_bytes{namespace="pg-${teamSlug}"}
    * on (namespace, persistentvolumeclaim) group_left(pod)
      kube_pod_spec_volumes_persistentvolumeclaims_info{
        namespace="pg-${teamSlug}",
        pod=~"${name}-[0-9]+"
      }
  )
)
/
clamp_min(
  sum by (namespace, pod) (
    kubelet_volume_stats_capacity_bytes{namespace="pg-${teamSlug}"}
    * on (namespace, persistentvolumeclaim) group_left(pod)
      kube_pod_spec_volumes_persistentvolumeclaims_info{
        namespace="pg-${teamSlug}",
        pod=~"${name}-[0-9]+"
      }
  ),
  1
)
`}
	environmentName={envName}
	height="300px"
	labelFormatter={(labels) => {
		const pod = labels.find((l) => l.name === 'pod')?.value;
		return `Disk utilization${pod ? ` (${pod})` : ''}`;
	}}
	formatYValue={formatPercentage}
/>
