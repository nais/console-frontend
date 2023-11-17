<script lang="ts">
	import { goto } from '$app/navigation';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageCPUTransformLineChart,
		resourceUsageMemoryTransformLineChart,
		type CPU,
		type Memory
	} from '$lib/chart/resource_usage_transformer';
	import { Alert, Loader } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);

	$: resourceUtilization = $ResourceUtilizationForApp.data?.resourceUtilizationForApp;
	$: dateRange = $ResourceUtilizationForApp.data?.resourceUtilizationDateRangeForTeam;

	$: minDate = dateRange?.from;
	$: maxDate = dateRange?.to;

	$: min =
		minDate && minDate !== PendingValue
			? minDate.toISOString().split('T')[0]
			: new Date(Date.now() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
	$: max =
		maxDate && maxDate !== PendingValue
			? maxDate.toISOString().split('T')[0]
			: new Date(Date.now()).toISOString().split('T')[0];

	function echartOptionsCPUChart(data: CPU[]) {
		const opts = resourceUsageCPUTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsMemoryChart(data: Memory[]) {
		const opts = resourceUsageMemoryTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	$: {
		if (maxDate && maxDate !== PendingValue) {
			if (data.toDate > maxDate) {
				from = new Date(maxDate.getTime() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
				to = max;
				update();
			}
		}
	}
</script>

{#if $ResourceUtilizationForApp.errors}
	<Alert variant="error">
		{#each $ResourceUtilizationForApp.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if resourceUtilization}
	<div class="grid">
		<Card columns={12}>
			<h4>Resource utilization</h4>

			<label for="from">From:</label>
			<input type="date" id="from" {min} {max} bind:value={from} on:change={update} />
			<label for="to">To:</label>
			<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />
			{#if resourceUtilization && resourceUtilization !== PendingValue}
				<EChart options={echartOptionsCPUChart(resourceUtilization.cpu)} style="height: 400px" />
			{:else}
				<div class="loading">
					<Loader />
				</div>
			{/if}
			{#if resourceUtilization && resourceUtilization !== PendingValue}
				<EChart
					options={echartOptionsMemoryChart(resourceUtilization.memory)}
					style="height: 400px"
				/>
			{:else}
				<div class="loading">
					<Loader />
				</div>
			{/if}
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
	.loading {
		height: 400px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>
