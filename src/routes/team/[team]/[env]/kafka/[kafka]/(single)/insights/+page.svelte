<script lang="ts">
	import { page } from '$app/state';
	import PrometheusChart from '$lib/chart/PrometheusChart.svelte';
	import { PrometheusChartQueryInterval } from '$lib/chart/util';
	import { changeParams } from '$lib/utils/searchparams';
	import { ToggleGroup, ToggleGroupItem } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { interval } = $derived(data);

	// Get the topic name and environment name from route params
	const teamSlug = $derived(page.params.team!);
	const topicName = $derived(page.params.kafka!);
	const environmentName = $derived(page.params.env!);

	// Construct the full topic name for metrics queries
	const fullTopicName = $derived(`${teamSlug}.${topicName}`);
</script>

<div class="mb-2 flex justify-end">
	<ToggleGroup
		bind:value={interval}
		onchange={() => {
			changeParams({ interval });
		}}
	>
		{#each Object.values(PrometheusChartQueryInterval) as intervalOption (intervalOption)}
			<ToggleGroupItem value={intervalOption}>{intervalOption}</ToggleGroupItem>
		{/each}
	</ToggleGroup>
</div>

<!-- Messages In (Rate) -->
<PrometheusChart
	{environmentName}
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count{topic="${fullTopicName}"}[5m]))`}
	{interval}
	labelFormatter={() => 'Messages In/sec'}
	formatYValue={(value) => `${value.toFixed(2)} msg/s`}
/>

<!-- Messages Per Second (Broker) -->
<PrometheusChart
	{environmentName}
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count{topic="${fullTopicName}"}[2m]))`}
	{interval}
	labelFormatter={() => 'Messages/sec (Broker)'}
	formatYValue={(value) => `${value.toFixed(2)} msg/s`}
/>

<!-- Bytes In/sec -->
<PrometheusChart
	{environmentName}
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_BytesInPerSec_Count{topic="${fullTopicName}"}[2m]))`}
	{interval}
	labelFormatter={() => 'Bytes In/sec'}
	formatYValue={(value) => `${(value / 1024).toFixed(2)} KB/s`}
	colorizer={() => '#2ca02c'}
/>

<!-- Bytes Out/sec -->
<PrometheusChart
	{environmentName}
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_BytesOutPerSec_Count{topic="${fullTopicName}"}[2m]))`}
	{interval}
	labelFormatter={() => 'Bytes Out/sec'}
	formatYValue={(value) => `${(value / 1024).toFixed(2)} KB/s`}
	colorizer={() => '#d62728'}
/>

<!-- Consumer Group Lag -->
<PrometheusChart
	{environmentName}
	query={`sum(kafka_consumergroup_group_topic_sum_lag{topic="${fullTopicName}"})`}
	{interval}
	labelFormatter={() => 'Consumer Lag'}
	formatYValue={(value) => `${Math.round(value)} msgs`}
/>
