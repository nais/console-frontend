<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformStackedColumnChart,
		getMaxFromDate,
		getMinToDate,
		type DailCostType
	} from '$lib/chart/cost_transformer';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { JobCost } = $derived(data);

	let job = page.params.job;
	let from = $state(data.fromDate?.toISOString().split('T')[0]);
	let to = $state(data.toDate?.toISOString().split('T')[0]);

	const today = new Date();
	today.setDate(today.getDate() - 2);
	const todayMinusTwoDays = today.toISOString().split('T')[0];

	function echartOptionsStackedColumnChart(data: DailCostType) {
		const opts = costTransformStackedColumnChart(new Date(from), new Date(to), data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 50 };
		return opts;
	}

	function update() {
		const old = $JobCost.variables!;
		JobCost.fetch({ variables: { ...old, from: new Date(from), to: new Date(to) } });
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true });
	}
</script>

<div style="display: flex; flex-direction: column; gap: var(--a-spacing-4);">
	<GraphErrors errors={$JobCost.errors} />

	<Alert variant="info">Work in progress. Some cost types might not be available.</Alert>

	{#if $JobCost.data}
		{@const d = $JobCost.data.team.environment.job.cost.daily}
		<div>
			<h4>Total cost for job {job} from {from} to {to}</h4>
			<label for="from">From:</label>
			<input type="date" max={getMaxFromDate(to)} id="from" bind:value={from} onchange={update} />
			<label for="to">To:</label>
			<input
				type="date"
				min={getMinToDate(from)}
				max={todayMinusTwoDays}
				id="to"
				bind:value={to}
				onchange={update}
			/>
			<EChart options={echartOptionsStackedColumnChart(d)} style="height: 400px" />
		</div>
	{/if}
</div>
