<script lang="ts">
	import { goto } from '$app/navigation';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { costTransformStackedColumnChart } from '$lib/chart/cost_transformer';
	import TeamCostEnv from '$lib/components/TeamCostEnv.svelte';
	import { Alert, Heading } from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { TeamCost, teamSlug } = $derived(data);

	let from = $state(data.fromDate?.toISOString().split('T')[0]);
	let to = $state(data.toDate?.toISOString().split('T')[0]);

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

<div class="wrapper">
	<GraphErrors errors={$TeamCost.errors} />

	<Alert variant="info">Work in progress. Some cost types might not be available.</Alert>

	{#if $TeamCost.data}
		<div>
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
		</div>
		<div>
			<Heading level="2" spacing>Cost by Service</Heading>
			<EChart
				options={costTransformStackedColumnChart(
					new Date(from),
					new Date(to),
					$TeamCost.data.team.cost.daily
				)}
				style="height: 500px"
			/>
		</div>

		<TeamCostEnv team={teamSlug} from={fromDate} to={toDate} />
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
</style>
