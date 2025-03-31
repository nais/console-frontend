<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		costTransformStackedColumnChart,
		getMaxFromDate,
		getMinToDate
	} from '$lib/chart/cost_transformer';
	import { Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { JobCost } = $derived(data);

	let job = page.params.job;
	let from = $state(data.fromDate?.toISOString().split('T')[0]);
	let to = $state(data.toDate?.toISOString().split('T')[0]);

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	const today = new Date();
	today.setDate(today.getDate() - 2);
	const todayMinusTwoDays = today.toISOString().split('T')[0];
</script>

<GraphErrors errors={$JobCost.errors} />

{#if $JobCost.data}
	{@const d = $JobCost.data.team.environment.job.cost.daily}
	<Heading level="2" spacing>Cost by Service for Job {job}</Heading>
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
	<EChart
		options={costTransformStackedColumnChart(new Date(from), new Date(to), d)}
		style="height: 400px"
	/>
{/if}

<style>
</style>
