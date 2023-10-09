<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { JobCost$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ JobCost } = data);

	let job = $page.params.job;
	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	function echartOptionsStackedColumnChart(data: JobCost$result['dailyCostForApp']) {
		const opts = costTransformStackedColumnChart(new Date(from), new Date(to), data);
		opts.height = '250px';
		opts.legend = { bottom: 50 };
		return opts;
	}

	function update() {
		const old = $JobCost.variables!;
		JobCost.fetch({ variables: { ...old, from: new Date(from), to: new Date(to) } });
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true });
	}
</script>

{#if $JobCost.errors}
	<Alert variant="error">
		{#each $JobCost.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

<Alert variant="info">Work in progress. Some cost types might not be available.</Alert>

{#if $JobCost.data}
	<div class="grid">
		<Card columns={12}>
			<h4>Total cost for job {job} from {from} to {to}</h4>
			<label for="from">From:</label>
			<input type="date" id="from" bind:value={from} on:change={update} />
			<label for="to">To:</label>
			<input type="date" id="to" bind:value={to} on:change={update} />
			<EChart options={echartOptionsStackedColumnChart($JobCost.data.dailyCostForApp)} style="height: 400px" />
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
