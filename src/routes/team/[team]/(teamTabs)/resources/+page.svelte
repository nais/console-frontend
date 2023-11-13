<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageTeamCPUTransformLineChart,
		resourceUsageTeamMemoryTransformLineChart,
		resourceUtilizationOverageTransformLineChart,
		type Overage,
		type Utilization
	} from '$lib/chart/resource_usage_transformer';
	import { Alert, Loader } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForTeam } = data);

	$: team = $page.params.team;

	function echartOptionsCPUChart(data: Utilization[]) {
		const opts = resourceUsageTeamCPUTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}
	function echartOptionsMemoryChart(data: Utilization[]) {
		const opts = resourceUsageTeamMemoryTransformLineChart(data);
		opts.height = '250px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsOverageChart(data: Overage[]) {
		const opts = resourceUtilizationOverageTransformLineChart(data);
		opts.height = '250px'; //height: '200px'
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function update() {
		const params = new URLSearchParams({ from, to });
		goto(`?${params.toString()}`, { replaceState: true, noScroll: true });
	}

	$: minDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.from;
	$: maxDate = $ResourceUtilizationForTeam.data?.resourceUtilizationDateRangeForTeam.to;

	$: min = minDate && minDate !== PendingValue ? minDate.toISOString().split('T')[0] : '';
	$: max = maxDate && maxDate !== PendingValue ? maxDate.toISOString().split('T')[0] : '';

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
{#if $ResourceUtilizationForTeam.data}
	<div class="grid">
		<Card columns={4}>
			<label for="from">From:</label>
			<input type="date" id="from" {min} {max} bind:value={from} on:change={update} />
			<label for="to">To:</label>
			<input type="date" id="to" {min} {max} bind:value={to} on:change={update} />
		</Card>

		<Card columns={8}>
			{#if $ResourceUtilizationForTeam.data.resourceUtilizationOverageCostForTeam.sum === PendingValue}
				<div class="loading">
					<Loader />
				</div>
			{:else}
				Waste: {$ResourceUtilizationForTeam.data.resourceUtilizationOverageCostForTeam.sum} NOK
			{/if}
		</Card>
		<Card columns={12}>
			{#if $ResourceUtilizationForTeam.data.resourceUtilizationOverageCostForTeam.apps[0].overage === PendingValue}
				<div class="loading">
					<Loader />
				</div>
			{:else}
				<EChart
					options={echartOptionsOverageChart(
						$ResourceUtilizationForTeam.data.resourceUtilizationOverageCostForTeam.apps
					)}
					style="height: 400px"
					on:click={(e) => {
						console.log(e.detail.name);
						const [env, app] = e.detail.name.split(':');
						goto(`/team/${team}/${env}/app/${app}/resources`);
					}}
				/>
			{/if}
		</Card>

		{#each $ResourceUtilizationForTeam.data.resourceUtilizationForTeam as env}
			<Card columns={12}>
				{#if env.env !== PendingValue}
					<h4>Utilization in {env.env}</h4>
				{/if}
				<div style="display: flex; ">
					<div style="width: 50%;">
						{#if env.env === PendingValue}
							<div class="loading">
								<Loader />
							</div>
						{:else if env.cpu.length === 0}
							<p>No CPU utilization data for team {team} in {env.env}</p>
						{:else}
							<EChart options={echartOptionsCPUChart(env.cpu)} style="height: 400px" />
						{/if}
					</div>
					<div style="width: 50%; margin: 0; padding: 0;">
						{#if env.env === PendingValue}
							<div class="loading">
								<Loader />
							</div>
						{:else if env.memory.length === 0}
							<p>No memory utilization data for team {team} in {env.env}</p>
						{:else}
							<EChart options={echartOptionsMemoryChart(env.memory)} style="height: 400px" />
						{/if}
					</div>
				</div>
			</Card>
		{/each}
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
