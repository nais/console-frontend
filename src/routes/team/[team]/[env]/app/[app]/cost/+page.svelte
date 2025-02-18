<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformStackedColumnChart,
		getMaxFromDate,
		getMinToDate,
		type DailCostType
	} from '$lib/chart/cost_transformer';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { AppCost } = $derived(data);

	let app = page.params.app;
	let from = $state(data.fromDate?.toISOString().split('T')[0]);
	let to = $state(data.toDate?.toISOString().split('T')[0]);

	function echartOptionsStackedColumnChart(data: DailCostType) {
		const opts = costTransformStackedColumnChart(new Date(from), new Date(to), data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 50 };
		return opts;
	}

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	const today = new Date();
	today.setDate(today.getDate() - 2);
	const todayMinusTwoDays = today.toISOString().split('T')[0];
</script>

<PageHeader {...urlToPageHeader(page.url)} />

<GraphErrors errors={$AppCost.errors} />

<Alert variant="info">Work in progress. Some cost types might not be available.</Alert>

{#if $AppCost.data}
	{@const d = $AppCost.data.team.environment.application.cost.daily}
	<div class="grid">
		<Card columns={12}>
			<h4>Total cost for app {app} from {from} to {to}</h4>
			<label for="from">From:</label>
			<input type="date" max={getMaxFromDate(to)} id="from" bind:value={from} onchange={update} />
			<label for="to">To:</label>
			<input
				type="date"
				id="to"
				min={getMinToDate(from)}
				max={todayMinusTwoDays}
				bind:value={to}
				onchange={update}
			/>

			<EChart options={echartOptionsStackedColumnChart(d)} style="height: 400px" />
		</Card>
	</div>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
