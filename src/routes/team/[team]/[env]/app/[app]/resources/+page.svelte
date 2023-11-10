<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ResourceUtilizationForApp$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageCPUTransformLineChart,
		resourceUsageMemoryTransformLineChart
	} from '$lib/chart/resource_usage_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);

	let app = $page.params.app;
	let team = $page.params.team;
	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	function echartOptionsCPUChart(
		data: ResourceUtilizationForApp$result['resourceUtilizationForApp']['cpu']
	) {
		const opts = resourceUsageCPUTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsMemoryChart(
		data: ResourceUtilizationForApp$result['resourceUtilizationForApp']['memory']
	) {
		const opts = resourceUsageMemoryTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	const today = new Date().toISOString().split('T')[0];
	const todayMinus30 = new Date(new Date().setDate(new Date().getDate() - 30))
		.toISOString()
		.split('T')[0];
</script>

{#if $ResourceUtilizationForApp.errors}
	<Alert variant="error">
		{#each $ResourceUtilizationForApp.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

<Alert variant="info"
	>These graphs shows the CPU and memory usage over time for {team}:{app} in conjunction with the defined
	requests. If usage is below requests, you are kind of waisting money, and should set a lower request.<br
	/>
	Within a duration of a week the resolution is hourly, and with a higher durations the resolution is
	daily.</Alert
>
{#if $ResourceUtilizationForApp.data}
	<div class="grid">
		<Card columns={12}>
			<h4>Resource utilization</h4>

			<label for="from">From:</label>
			<input
				type="date"
				id="from"
				min={todayMinus30}
				max={to}
				bind:value={from}
				on:change={update}
			/>
			<label for="to">To:</label>
			<input type="date" id="to" min={from} max={today} bind:value={to} on:change={update} />
			<EChart
				options={echartOptionsCPUChart(
					$ResourceUtilizationForApp.data.resourceUtilizationForApp.cpu
				)}
				style="height: 400px"
			/>
			<EChart
				options={echartOptionsMemoryChart(
					$ResourceUtilizationForApp.data.resourceUtilizationForApp.memory
				)}
				style="height: 400px"
			/>
		</Card>
	</div>
{/if}

<style>
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
