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

	// Get the topic name and environment name from route params
	const teamSlug = $derived(page.params.team!);
	const topicName = $derived(page.params.kafka!);
	const environmentName = $derived(page.params.env!);

	// Construct the full topic name for metrics queries
	const fullTopicName = $derived(`${teamSlug}.${topicName}`);
</script>

<div class="flex justify-end sticky top-0 z-100 p-2">
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

<PrometheusChart
	{environmentName}
	title="Messages in"
	description="Rate of messages produced to the topic, averaged over 5 minutes."
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count{topic="${fullTopicName}"}[5m]))`}
	{interval}
	labelFormatter={() => 'Messages In/sec'}
	formatYValue={(value) => `${value.toFixed(2)} msg/s`}
/>

<PrometheusChart
	{environmentName}
	title="Topic size"
	description="Total size on disk across all partitions and replicas."
	query={`sum by(topic) (kafka_log_Log_Size_Value{topic="${fullTopicName}"})`}
	{interval}
	labelFormatter={() => 'Topic Size'}
	formatYValue={(value) => prettyBytes(value)}
	colorizer={() => '#9467bd'}
/>

<PrometheusChart
	{environmentName}
	title="Partition size"
	description="Size on disk per partition. Useful for spotting partition skew."
	query={`sum by(partition) (kafka_log_Log_Size_Value{topic="${fullTopicName}"})`}
	{interval}
	labelFormatter={(labels) => {
		const partition = labels.find((l) => l.name === 'partition')?.value;
		return partition !== undefined ? `Partition ${partition}` : 'Partition';
	}}
	formatYValue={(value) => prettyBytes(value)}
/>

<PrometheusChart
	{environmentName}
	title="Messages per second (broker)"
	description="Rate of messages produced to the topic, averaged over 2 minutes."
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_MessagesInPerSec_Count{topic="${fullTopicName}"}[2m]))`}
	{interval}
	labelFormatter={() => 'Messages/sec (Broker)'}
	formatYValue={(value) => `${value.toFixed(2)} msg/s`}
/>

<PrometheusChart
	{environmentName}
	title="Bytes in"
	description="Rate of data produced to the topic by clients."
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_BytesInPerSec_Count{topic="${fullTopicName}"}[2m]))`}
	{interval}
	labelFormatter={() => 'Bytes In/sec'}
	formatYValue={(value) => `${prettyBytes(value)}/s`}
	colorizer={() => '#2ca02c'}
/>

<PrometheusChart
	{environmentName}
	title="Bytes out"
	description="Rate of data consumed from the topic by clients."
	query={`sum by(topic) (rate(kafka_server_BrokerTopicMetrics_BytesOutPerSec_Count{topic="${fullTopicName}"}[2m]))`}
	{interval}
	labelFormatter={() => 'Bytes Out/sec'}
	formatYValue={(value) => `${prettyBytes(value)}/s`}
	colorizer={() => '#d62728'}
/>

<PrometheusChart
	{environmentName}
	title="Consumer group lag"
	description="Total number of messages consumer groups are behind the latest offset."
	query={`sum(kafka_consumergroup_group_topic_sum_lag{topic="${fullTopicName}"})`}
	{interval}
	labelFormatter={() => 'Consumer Lag'}
	formatYValue={(value) => `${Math.round(value)} msgs`}
/>
