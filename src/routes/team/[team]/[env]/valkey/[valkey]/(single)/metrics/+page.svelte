<script lang="ts">
	import PrometheusChart, {
		PrometheusChartQueryInterval
	} from '$lib/components/PrometheusChart.svelte';
	import { ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';

	let interval: PrometheusChartQueryInterval = $state('7d');

	const aivenServiceName = $derived.by(() => {
		return 'valkey-teampam-stillingsok';
		// TODO(thokra): Make this use actual data
		// const teamSlug = 'aap';
		// if (isManagedByConsole) {
		// 	return `valkey-${teamSlug!}-${$Valkey.data?.team.environment.valkey.name}`;
		// }
		// return $Valkey.data?.team.environment.valkey.name;
	});
</script>

<div class="my-2 flex justify-end">
	<ToggleGroup bind:value={interval}>
		{#each Object.values(PrometheusChartQueryInterval) as interval (interval)}
			<ToggleGroupItem value={interval}>{interval}</ToggleGroupItem>
		{/each}
	</ToggleGroup>
</div>

<PrometheusChart
	{interval}
	query={`100 - cpu_usage_idle{service="${aivenServiceName}"}`}
	environmentName="dev-gcp"
	height="300px"
	labelFormatter={(labels) => labels.find((l) => l.name === 'cpu')?.value ?? 'Missing label'}
	formatYValue={(value: number) => {
		if (value % 1 !== 0) {
			return value.toFixed(2) + '%';
		}
		return value.toString() + '%';
	}}
/>
<PrometheusChart
	{interval}
	query={`100 - mem_available_percent{service="${aivenServiceName}"}`}
	environmentName="dev-gcp"
	height="300px"
	labelFormatter={() => 'Memory used'}
	formatYValue={(value: number) => value.toFixed(2) + '%'}
/>

<PrometheusChart
	{interval}
	query={`disk_free{service="${aivenServiceName}"}`}
	environmentName="dev-gcp"
	height="300px"
	labelFormatter={() => 'Disk free'}
	formatYValue={(value: number) => prettyBytes(value)}
/>

<PrometheusChart
	{interval}
	query={`increase(net_bytes_recv{service="${aivenServiceName}"}[5m])`}
	environmentName="dev-gcp"
	height="300px"
	labelFormatter={() => 'Network received'}
	formatYValue={(value: number) => prettyBytes(value) + '/s'}
/>

<PrometheusChart
	{interval}
	query={`increase(net_bytes_sent{service="${aivenServiceName}"}[5m])`}
	environmentName="dev-gcp"
	height="300px"
	labelFormatter={() => 'Network sent'}
	formatYValue={(value: number) => prettyBytes(value) + '/s'}
/>
