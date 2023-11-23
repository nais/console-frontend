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
	import { sumCPURequests, sumMemoryRequests } from '$lib/utils/resources';
	import { Alert, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);

	$: resourceUtilization = $ResourceUtilizationForApp.data?.resourceUtilizationForApp;
	$: dateRange = $ResourceUtilizationForApp.data?.resourceUtilizationDateRangeForTeam;
	$: currentUtilization = $ResourceUtilizationForApp.data?.currentResourceUtilizationForApp;
	$: app = $ResourceUtilizationForApp.data?.app;

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
{/if}

{#if resourceUtilization && resourceUtilization !== PendingValue}
	<div class="grid">
		{#if app && app !== PendingValue && app.instances.length > 0 && currentUtilization && currentUtilization.cpu !== PendingValue}
			<Card columns={3}>
				<div class="summaryCard">
					<div class="summaryIcon" style="--bg-color: #83bff6">
						<CpuIcon size="32" color="#83bff6" />
					</div>
					<div class="summary">
						<h4>CPU utilization</h4>
						<p class="metric">
							{currentUtilization.cpu.toLocaleString('en-GB', {
								maximumFractionDigits: 0
							})}% of {sumCPURequests(app?.instances.length, app?.resources.requests.cpu)} CPUs
						</p>
					</div>
				</div></Card
			>
			<Card columns={3}>
				<div class="summaryCard" style="--bg-color: #91dc75">
					<div class="summaryIcon">
						<MemoryIcon size="32" color="#91dc75" />
					</div>
					<div class="summary">
						<h4>Memory utilization</h4>
						<p class="metric">
							{currentUtilization.memory.toLocaleString('en-GB', {
								maximumFractionDigits: 0
							})}% of {sumMemoryRequests(app?.instances.length, app?.resources.requests.memory)}
						</p>
					</div>
				</div></Card
			>
		{/if}

		<Card columns={3}>
			<div class="summaryCard" style="--bg-color: #83bff6">
				<div class="summaryIcon">
					<CostIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>Cost of unused CPU</h4>
					<p class="metric">€100000</p>
				</div>
			</div></Card
		>
		<Card columns={3}>
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>Cost of unused memory</h4>
					<p class="metric">€100000</p>
				</div>
			</div></Card
		>
		<Card columns={12}>
			{#if minDate && maxDate && minDate !== PendingValue && maxDate !== PendingValue}
				{#if resourceUtilization.cpu.length > 0}
					<h3>Utilization</h3>

					<label for="from">From:</label>
					<input type="date" id="from" {min} {max} bind:value={from} on:change={update} />
					<label for="to">To:</label>
					<input type="date" id="to" min={from} {max} bind:value={to} on:change={update} />

					<p>
						This graph displays the percentage of requests used for memory and CPU. You should aim
						for at least 100% to save cost.
					</p>
					<EChart
						options={echartOptionsUsagePercentage(resourceUtilization)}
						style="height: 400px"
					/>
				{:else}
					<Alert variant="warning">No data available</Alert>
				{/if}
			{/if}
		</Card>
	</div>
{:else}
	<div class="grid">
		<Skeleton variant={'rectangle'} />
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
