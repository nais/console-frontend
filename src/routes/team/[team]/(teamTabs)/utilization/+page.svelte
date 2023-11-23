<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageTeamTransformLineChart,
		resourceUtilizationCPUOverageTransformLineChart,
		resourceUtilizationMemoryOverageTransformLineChart
	} from '$lib/chart/resource_usage_team_transformers';
	import type { Overage, Utilization } from '$lib/chart/types';
	import { Alert, Loader } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForTeam } = data);
	$: overageCostForTeam = $ResourceUtilizationForTeam.data?.resourceUtilizationOverageForTeam;
	$: resourceUtilization = $ResourceUtilizationForTeam.data?.resourceUtilizationForTeam;

	$: minDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.from;
	$: maxDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.to;

	$: min =
		minDate && minDate !== PendingValue
			? minDate.toISOString().split('T')[0]
			: new Date(Date.now() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
	$: max =
		maxDate && maxDate !== PendingValue
			? maxDate.toISOString().split('T')[0]
			: new Date(Date.now()).toISOString().split('T')[0];

	$: team = $page.params.team;

	function echartOptionsUsageChart(data: Utilization) {
		const opts = resourceUsageTeamTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsCPUOverageChart(data: Overage[]) {
		const opts = resourceUtilizationCPUOverageTransformLineChart(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsMemoryOverageChart(data: Overage[]) {
		const opts = resourceUtilizationMemoryOverageTransformLineChart(data);
		opts.height = '150px';
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

{#if $ResourceUtilizationForTeam.errors}
	<Alert variant="error">
		{#each $ResourceUtilizationForTeam.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
<div class="grid">
	{#if overageCostForTeam && resourceUtilization}
		<Card columns={3}
			><div class="summary">
				<h4>CPU utilization</h4>
				<p class="metric">0.99% of 1024Mi</p>
			</div></Card
		>
		<Card columns={3}
			><div class="summary">
				<h4>Memory utilization</h4>
				<p class="metric">21.47% of 3Gi</p>
			</div></Card
		>
		<Card columns={3}
			><div class="summary">
				<h4>Annual cost of unused CPU</h4>
				<p class="metric">€100000</p>
			</div></Card
		>
		<Card columns={3}
			><div class="summary">
				<h4>Annual cost of unused memory</h4>
				<p class="metric">€100000</p>
			</div></Card
		>
		<Card columns={12}>
			<h3>Unused resources per application</h3>
			<label for="from">From:</label>
			<input type="date" id="from" {min} {max} bind:value={from} on:change={update} />
			<label for="to">To:</label>
			<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />
			<div style="display: flex">
				{#if overageCostForTeam === PendingValue}
					<div class="loading">
						<Loader />
					</div>
				{:else}
					<EChart
						options={echartOptionsCPUOverageChart(overageCostForTeam.cpu)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${team}/${env}/app/${app}/utilization`);
						}}
					/>
				{/if}

				{#if overageCostForTeam === PendingValue}
					<div class="loading">
						<Loader />
					</div>
				{:else}
					<EChart
						options={echartOptionsMemoryOverageChart(overageCostForTeam.memory)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${team}/${env}/app/${app}/utilization`);
						}}
					/>
				{/if}
			</div>

			{#each resourceUtilization as env}
				{#if env.env !== PendingValue}
					<h3>Resource utilization in {env.env}</h3>
				{/if}
				{#if env.env === PendingValue}
					<div class="loading">
						<Loader />
					</div>
				{:else if env.cpu.length === 0}
					<p>No utilization data for team {team} in {env.env}</p>
				{:else}
					<EChart options={echartOptionsUsageChart(env)} style="height: 400px" />
				{/if}
			{/each}
		</Card>
	{/if}
</div>

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
	.summary {
		text-align: center;
	}
	.metric {
		font-size: 1.5rem;
	}
</style>
