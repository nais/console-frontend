<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '$lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '$lib/chart/util';
	import { changeParams } from '$lib/utils/searchparams';
	import { ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { interval } = $derived(data);

	const teamSlug = $derived(page.params.team!);
	const name = $derived(page.params.valkey!);
	const envName = $derived(page.params.env!);
	const isManagedByConsole = $derived(!name.startsWith(`valkey-${teamSlug}-`));

	const aivenServiceName = $derived.by(() => {
		if (isManagedByConsole) {
			return `valkey-${teamSlug}-${name}`;
		}
		return name;
	});

	const formatPercentage = (value: number) => {
		if (value % 1 !== 0) {
			return value.toFixed(2) + '%';
		}
		return value.toString() + '%';
	};
</script>

<div class="mb-2 flex justify-end">
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
	query={`100 - avg by (cpu) (cpu_usage_idle{service="${aivenServiceName}"})`}
	environmentName={envName}
	height="300px"
	labelFormatter={(labels) => labels.find((l) => l.name === 'cpu')?.value ?? 'Missing label'}
	formatYValue={formatPercentage}
/>

<PrometheusChart
	{interval}
	query={`100 - avg(mem_available_percent{service="${aivenServiceName}"})`}
	environmentName={envName}
	height="300px"
	labelFormatter={() => 'Memory used'}
	formatYValue={formatPercentage}
	colorizer={() => '#91dc75'}
/>

<PrometheusChart
	{interval}
	query={`avg(disk_used_percent{service="${aivenServiceName}"})`}
	environmentName={envName}
	height="300px"
	labelFormatter={() => 'Disk used'}
	formatYValue={formatPercentage}
/>

<PrometheusChart
	{interval}
	query={`avg(rate(net_bytes_recv{service="${aivenServiceName}"}[$__rate_interval]))`}
	environmentName={envName}
	height="300px"
	labelFormatter={() => 'Network received'}
	formatYValue={(value: number) => prettyBytes(value) + '/s'}
	colorizer={() => '#2ca02c'}
/>

<PrometheusChart
	{interval}
	query={`avg(rate(net_bytes_sent{service="${aivenServiceName}"}[$__rate_interval]))`}
	environmentName={envName}
	height="300px"
	labelFormatter={() => 'Network sent'}
	formatYValue={(value: number) => prettyBytes(value) + '/s'}
	colorizer={() => '#d62728'}
/>
