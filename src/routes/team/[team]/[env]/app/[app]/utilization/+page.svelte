<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { Alert, HelpText, Skeleton } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import prettyBytes from 'pretty-bytes';
	import { ResourceType, type ResourceType$options } from '$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);
	export const start = new Date();

	$: cpuUsageRange= $ResourceUtilizationForApp.data?.app.resources.cpu;
	$: memoryUsage = $ResourceUtilizationForApp.data?.app.resources.mem;
	$: memoryReq = $ResourceUtilizationForApp.data?.app.resources.requests.memory;
	$: cpuReq = $ResourceUtilizationForApp.data?.app.resources.requests.cpu;
	$: curr_cpu = $ResourceUtilizationForApp.data?.app.resources.curr_cpu;
	$: curr_mem = $ResourceUtilizationForApp.data?.app.resources.curr_mem;

	type resourceUtilizationForAppV2 =
		| {
				readonly timestamp: Date;
				readonly value: number;
		  }[]
		| undefined;

	// costPerHour calculates the cost for the given resource type
	function yearlyOverageCost(
		resourceType: ResourceType$options,
		request: number,
		utilization: number
	) {
		const costPerCpuCorePerYear = 136.69;
		const costPerByteMemoryPerYear = 18.71 / 1024 / 1024 / 1024;
		let overage = request - request * (utilization / 100);

		let cost = 0.0;

		if (resourceType == ResourceType.CPU) {
			cost = costPerCpuCorePerYear * overage;
		} else {
			cost = costPerByteMemoryPerYear * overage;
		}

		return cost > 0.0 ? cost : 0.0;
	}

	function options(cpuData: resourceUtilizationForAppV2, memoryData: resourceUtilizationForAppV2) {
		const dates = cpuData?.map((d) => d.timestamp) || [];
		const xAxis = {
			type: 'category',
			boundaryGap: false,
			data: dates.map((date) => {
				return date.toLocaleDateString('en-GB', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
			})
		};

		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				valueFormatter: (value: number) =>
					value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '%'
			},
			xAxis: xAxis,
			series: [
				{
					name: 'CPU',
					type: 'line',
					data: cpuData?.map((d) => d.value) || []
				},
				{
					name: 'MEMORY',
					type: 'line',
					data: memoryData?.map((d) => d.value) || []
				}
			],

			yAxis: {
				type: 'value',
				name: 'Usage of requested resources',
				axisLabel: {
					formatter: (value: number) =>
						value.toLocaleString('en-GB', { maximumFractionDigits: 2 }) + '%'
				},
				scale: false
			}
		};
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
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization">
							Current CPU utilization based on the total cores requested for all instances
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_cpu && cpuReq}
							{curr_cpu.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {cpuReq} CPUs
						{:else}
							<Skeleton variant="text" width="200px" />
						{/if}
					</p>
				</div>
			</div></Card
		>

		<!-- <Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<MemoryIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization">
							Current memory utilization based on the total memory requested for all instances
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_mem && memoryReq}
							{curr_mem.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}% of {prettyBytes(memoryReq, {
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
					<h4>
						Cost of unused CPU<HelpText title="Annual cost of unused CPU">
							Estimate of annual cost of unused CPU calculated based on current utilization.
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_cpu && cpuReq}
							€ {yearlyOverageCost(ResourceType.CPU, cpuReq, curr_cpu).toLocaleString('en-GB', {
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
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4 style="font-size: 0.9rem">
						Cost of unused memory<HelpText title="Annual cost of unused memory">
							Estimate of annual cost of unused memory calculated based on current utilization.
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_mem && memoryReq}
							€ {yearlyOverageCost(ResourceType.MEMORY, memoryReq, curr_mem).toLocaleString('en-GB', {
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
		<Card columns={12} borderColor="var(--a-gray-200)">
			<span class="graphHeader">
				<h3 style={'margin-bottom: 0'}>Resource utilization</h3>
				<span class="intervalPicker">
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval}
						<a
							class:active={($page.url.searchParams.get('interval') || '7d') == interval}
							href="?interval={interval}">{interval}</a
						>
					{/each}
				</span>
			</span>
			{#if cpuUtilization}
				<EChart options={options(cpuUtilization, memoryUtilization)} style="height: 400px" />
			{:else}
				<div class="loading">
					<Skeleton variant={'rectangle'} height="450px" />
				</div>
			{/if}
		</Card> -->
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
		display: flex;
		gap: 0.5rem;
		margin: 0;
		font-size: 1rem;
		color: var(--color-text-secondary);
	}
	.metric {
		display: flex;
		gap: 0.5rem;
		font-size: 1.5rem;
		margin: 0;
		white-space: nowrap;
	}
	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
	.graphHeader {
		display: flex;
		justify-content: space-between;
	}
	a {
		cursor: pointer;
		text-decoration: none;
		color: var(--a-text-default);
	}
	a.active {
		font-weight: 600;
		text-decoration: underline;
	}
	a:hover {
		text-decoration: underline;
	}
	.intervalPicker {
		display: flex;
		gap: 1rem;
	}
</style>
