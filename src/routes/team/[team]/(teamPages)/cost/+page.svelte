<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import Card from '$lib/Card.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart, type DailCostType } from '$lib/chart/cost_transformer';
	import TeamCostEnv from '$lib/components/TeamCostEnv.svelte';
	import { Alert } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { TeamCost } = $derived(data);

	let team = page.params.team;
	let from = $state(data.fromDate?.toISOString().split('T')[0]);
	let to = $state(data.toDate?.toISOString().split('T')[0]);

	function echartOptionsStackedColumnChart(data: DailCostType) {
		const opts = costTransformStackedColumnChart(new Date(from), new Date(to), data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 50 };
		return opts;
	}

	let fromDate = $state(new Date());
	let toDate = $state(new Date());

	$effect(() => {
		fromDate = new Date(from);
		toDate = new Date(to);
	});

	function update() {
		const old = $TeamCost.variables!;
		TeamCost.fetch({ variables: { ...old, from: new Date(from), to: new Date(to) } });
		const params = new URLSearchParams({ from, to });
		fromDate = new Date(from);
		toDate = new Date(to);
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	const today = new Date();
	today.setDate(today.getDate() - 2);
	const todayMinusTwoDays = today.toISOString().split('T')[0];
</script>

<GraphErrors errors={$TeamCost.errors} />

<Alert variant="info">Work in progress. Some cost types might not be available.</Alert>

{#if $TeamCost.data}
	<div class="grid">
		<Card columns={4}>
			<label for="from">From:</label>
			<input type="date" id="from" bind:value={from} onchange={update} />
			<label for="to">To:</label>
			<input
				type="date"
				id="to"
				min={from}
				max={todayMinusTwoDays}
				bind:value={to}
				onchange={update}
			/>
		</Card>
		<Card columns={12}>
			<h4>Total cost for team {team} from {from} to {to}</h4>
			<EChart
				options={echartOptionsStackedColumnChart($TeamCost.data.team.cost.daily)}
				style="height: 400px"
			/>
		</Card>

		<TeamCostEnv {team} from={fromDate} to={toDate} />
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
