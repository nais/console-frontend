<script lang="ts">
	import ChartBoundary from './ChartBoundary.svelte';
	import PrometheusChart, { type PrometheusChartProps } from './PrometheusChart.svelte';

	let props: PrometheusChartProps = $props();
</script>

<ChartBoundary>
	<PrometheusChart {...props} />
</ChartBoundary>
