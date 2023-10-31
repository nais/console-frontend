<script lang="ts">
	import type { AppResourceUtilization$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageCPUTransformStackedColumnChart,
		resourceUsageMemTransformStackedColumnChart
	} from '$lib/chart/resource_usage_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ AppResourceUtilization } = data);

	function echartOptionsStackedColumnChart(
		data: AppResourceUtilization$result['CPUUtilizationForApp']
	) {
		const opts = resourceUsageCPUTransformStackedColumnChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 50 };
		return opts;
	}

	function echartOptionsStackedColumnChart2(
		data: AppResourceUtilization$result['memoryUtilizationForApp']
	) {
		const opts = resourceUsageMemTransformStackedColumnChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 50 };
		return opts;
	}
</script>

{#if $AppResourceUtilization.errors}
	<Alert variant="error">
		{#each $AppResourceUtilization.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

<div class="grid">
	<Card columns={12}>
		<h3>Resources</h3>
		<h4>CPUUtilizationForApp</h4>
		{#if $AppResourceUtilization.data && $AppResourceUtilization.fetching === false}
			<EChart
				options={echartOptionsStackedColumnChart($AppResourceUtilization.data.CPUUtilizationForApp)}
				style="height: 400px"
			/>
		{/if}
		<h4>MemoryUtilizationForApp</h4>
		{#if $AppResourceUtilization.data && $AppResourceUtilization.fetching === false}
			<EChart
				options={echartOptionsStackedColumnChart2(
					$AppResourceUtilization.data.memoryUtilizationForApp
				)}
				style="height: 400px"
			/>
		{/if}
	</Card>
	<!--Card columns={12}>
		<h3>Resources</h3>
		{#if $AppResources.data}
			{#each $AppResources.data.dailyMemoryRequestForApp as metric}
				<p>{metric.timestamp}/{metric.value}</p>
			{/each}
		{/if}
	</Card-->
</div>

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
