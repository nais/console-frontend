<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { AppCost$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	export let data: PageData;

	$: ({ AppCost } = data);

	let app = $page.params.app;

	function echartOptionsStackedColumnChart(data: AppCost$result['cost']) {
		const opts = costTransformStackedColumnChart(data);
		opts.height = '250px';
		opts.legend = { bottom: 50 };
		return opts;
	}
	let from = data.fromDate?.toISOString().split('T')[0];
	let to = data.toDate?.toISOString().split('T')[0];

	function update() {
		const old = $AppCost.variables!;
		AppCost.fetch({ variables: { ...old, from: new Date(from), to: new Date(to) } });
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true });
	}
</script>

{#if $AppCost.errors}
	<Alert variant="error">
		{#each $AppCost.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}

{#if $AppCost.data}
	<div class="grid">
		<Card columns={12}>
			<h4>Total cost for {app} from {from} to {to}</h4>
			<label for="from">From:</label>
			<input type="date" id="from" bind:value={from} on:change={update} />
			<label for="to">To:</label>
			<input type="date" id="to" bind:value={to} on:change={update} />
			<EChart options={echartOptionsStackedColumnChart($AppCost.data.cost)} style="height: 400px" />
		</Card>
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
