<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { resourceUsagePercentageTransformLineChart } from '$lib/chart/resource_usage_app_transformer';
	import type { ResourceUtilizationApp } from '$lib/chart/types';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);

	$: resourceUtilization = $ResourceUtilizationForApp.data?.resourceUtilizationForApp;
	$: dateRange = $ResourceUtilizationForApp.data?.resourceUtilizationDateRangeForTeam;
	$: currentUtilization = $ResourceUtilizationForApp.data?.currentResourceUtilizationForApp;

	$: minDate = dateRange?.from;
	$: maxDate = dateRange?.to;

	$: min =
		minDate && minDate !== PendingValue
			? minDate.toISOString().split('T')[0]
			: new Date(Date.now() - 7 * 1000 * 24 * 60 * 60).toISOString().split('T')[0];
	$: max =
		maxDate && maxDate !== PendingValue
			? maxDate.toISOString().split('T')[0]
			: new Date(Date.now()).toISOString().split('T')[0];

	function echartOptionsUsagePercentage(data: ResourceUtilizationApp) {
		const opts = resourceUsagePercentageTransformLineChart(data);
		opts.height = '250px';
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

	let tenant = $page.url.hostname;
	if (tenant === 'localhost') {
		tenant = 'nav';
	} else {
		tenant = tenant.split('.')[1];
	}
</script>

{#if $ResourceUtilizationForApp.errors}
	<Alert variant="error">
		{#each $ResourceUtilizationForApp.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #83bff6">
					<CpuIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>CPU utilization</h4>

					<p class="metric">
						{#if currentUtilization && currentUtilization.cpu !== PendingValue}
							{currentUtilization.cpu.utilization.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {currentUtilization.cpu.request.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})} CPUs
						{:else}
							<Skeleton variant="text" width="200px" />
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
						{#if currentUtilization && currentUtilization.cpu !== PendingValue}
							{currentUtilization.memory.utilization.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {prettyBytes(currentUtilization.memory.request, {
								locale: 'en',
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						{:else}
							<Skeleton variant="text" width="200px" />
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
						{#if currentUtilization && currentUtilization.cpu !== PendingValue}
							€{currentUtilization.cpu.estimatedAnnualOverageCost > 0.0
								? currentUtilization.cpu.estimatedAnnualOverageCost.toLocaleString('en-GB', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
								  })
								: '0.00'}
						{:else}
							<Skeleton variant="text" width="200px" />
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
						{#if currentUtilization && currentUtilization.cpu !== PendingValue}
							€{currentUtilization.memory.estimatedAnnualOverageCost > 0.0
								? currentUtilization.memory.estimatedAnnualOverageCost.toLocaleString('en-GB', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
								  })
								: '0.00'}
						{:else}
							<Skeleton variant="text" width="200px" />
						{/if}
					</p>
				</div>
			</div></Card
		>

		<Card columns={12} borderColor="var(--a-gray-200)">
			<h3>Resource utilization</h3>
			{#if resourceUtilization && resourceUtilization !== PendingValue}
				{#if minDate && maxDate && minDate !== PendingValue && maxDate !== PendingValue}
					<label for="from">From:</label>
					<input type="date" id="from" {min} max={to} bind:value={from} on:change={update} />
					<label for="to">To:</label>
					<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />

					{#if resourceUtilization.cpu.length > 0}
						<p>This graph displays the percentage of requests used for memory and CPU.</p>
						<EChart
							options={echartOptionsUsagePercentage(resourceUtilization)}
							style="height: 400px"
						/>
					{:else}
						<Alert variant="warning">No data available</Alert>
					{/if}
				{/if}
			{:else}
				<div class="loading">
					<Skeleton variant={'rectangle'} height="450px" />
				</div>
			{/if}
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
