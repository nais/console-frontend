<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { ResourceUtilizationForApp$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageCPUTransformStackedColumnChart,
		resourceUsageMemTransformStackedColumnChart
	} from '$lib/chart/resource_usage_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);

	let app = $page.params.app;
	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	let fromDate = new Date(from);
	let toDate = new Date(to);
	console.log(fromDate, toDate);

	function update() {
		const old = $ResourceUtilizationForApp.variables!;
		ResourceUtilizationForApp.fetch({
			variables: { ...old, from: new Date(from), to: new Date(to) }
		});
		const params = new URLSearchParams({ from, to });
		fromDate = new Date(from);
		toDate = new Date(to);
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	function echartOptionsStackedColumnChart(data: ResourceUtilizationForApp$result['cpu']) {
		const opts = resourceUsageCPUTransformStackedColumnChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsStackedColumnChart2(data: ResourceUtilizationForApp$result['memory']) {
		const opts = resourceUsageMemTransformStackedColumnChart(data);
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

{#if $ResourceUtilizationForApp.data}
	<div class="grid">
		<Card columns={4}>
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
		</Card>
		<Card columns={12}>
			<h4>Resource utilization for {app} from {from} to {to}</h4>
			<EChart
				options={echartOptionsStackedColumnChart($ResourceUtilizationForApp.data.cpu)}
				style="height: 400px"
			/>
			<EChart
				options={echartOptionsStackedColumnChart2($ResourceUtilizationForApp.data.memory)}
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
