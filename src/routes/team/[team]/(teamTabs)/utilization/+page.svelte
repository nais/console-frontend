<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Time from '$lib/Time.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import {
		resourceUsageTeamTransformLineChart,
		resourceUtilizationCPUOverageTransformLineChart,
		resourceUtilizationMemoryOverageTransformLineChart
	} from '$lib/chart/resource_usage_team_transformers';
	import type { Overage, Utilization } from '$lib/chart/types';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForTeam } = data);

	$: overageCostForTeam = $ResourceUtilizationForTeam.data?.resourceUtilizationOverageForTeam;
	$: resourceUtilization = $ResourceUtilizationForTeam.data?.resourceUtilizationForTeam;
	$: currentResourceUtilizationForTeam =
		$ResourceUtilizationForTeam.data?.currentResourceUtilizationForTeam;

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
	{#if overageCostForTeam && resourceUtilization && currentResourceUtilizationForTeam}
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #83bff6">
					<CpuIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>CPU utilization</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.cpu !== PendingValue}
							{currentResourceUtilizationForTeam.cpu.utilization.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {currentResourceUtilizationForTeam.cpu.request.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})} CPUs
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<MemoryIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>Memory utilization</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.memory !== PendingValue}
							{currentResourceUtilizationForTeam?.memory.utilization.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {prettyBytes(currentResourceUtilizationForTeam?.memory.request)}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard" style="--bg-color: #83bff6">
				<div class="summaryIcon">
					<CostIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>Annual cost of unused CPU</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.memory !== PendingValue}
							€{currentResourceUtilizationForTeam.cpu.estimatedAnnualOverageCost > 0.0
								? currentResourceUtilizationForTeam.cpu.estimatedAnnualOverageCost.toLocaleString(
										'en-GB',
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}
								  )
								: '0.00'}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>Annual cost of unused memory</h4>
					<p class="metric">
						{#if currentResourceUtilizationForTeam.memory !== PendingValue}
							€{currentResourceUtilizationForTeam.memory.estimatedAnnualOverageCost > 0.0
								? currentResourceUtilizationForTeam.memory.estimatedAnnualOverageCost.toLocaleString(
										'en-GB',
										{
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										}
								  )
								: '0.00'}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={12} borderColor="var(--a-gray-200)">
			<div style="display: flex; justify-content: space-between;">
				<h3>Unused resources per application</h3>
				{#if overageCostForTeam !== PendingValue && overageCostForTeam.timestamp !== null}
					<p style="text-align: right; color: var(--a-text-subtle)">
						Last updated: <Time time={overageCostForTeam.timestamp} distance={true} />
					</p>
				{:else}
					<p>Laste updated: <Skeleton variant="text" /></p>
				{/if}
			</div>

			<div style="display: flex">
				{#if overageCostForTeam === PendingValue}
					<div class="loading">
						<Skeleton variant="rectangle" />
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
					<div class="loading" style="width: 50%;">
						<Skeleton variant="rectangle" />
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
		</Card>
		<Card columns={12}>
			<h3>Resource utilization per environment</h3>
			<div class="datepicker">
				<label for="from">From:</label>
				<input type="date" id="from" {min} {max} bind:value={from} on:change={update} />
				<label for="to">To:</label>
				<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />
			</div>
			{#each resourceUtilization as env}
				{#if env.env !== PendingValue}
					<h4>Resource utilization in {env.env}</h4>
				{/if}
				{#if env.env === PendingValue}
					<div class="loading" style="width: 100%;">
						<Skeleton variant="rectangle" />
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
	.datepicker {
		margin-top: 1rem;
		margin-bottom: 1rem;
	}
	.loading {
		height: 400px;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.summaryIcon {
		display: flex;
		background-color: color-mix(in srgb, var(--bg-color) 10%, white);
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 2px solid var(--bg-color);
		border-radius: 5px;
	}
	.summary > h4 {
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.metric {
		font-size: 1.5rem;
		margin: 0;
	}
	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
