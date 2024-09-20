<script lang="ts">
	import { page } from '$app/stores';
	import { UsageResourceType } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { Alert, HelpText, Skeleton } from '@nais/ds-svelte-community';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ ResourceUtilizationForApp } = data);
	export const start = new Date();

	$: usageRange = $ResourceUtilizationForApp.data?.app.utilization;
	$: memoryReq = $ResourceUtilizationForApp.data?.app.utilization.req_mem;
	$: cpuReq = $ResourceUtilizationForApp.data?.app.utilization.req_cpu;
	$: curr_cpu = $ResourceUtilizationForApp.data?.app.utilization.curr_cpu;
	$: curr_mem = $ResourceUtilizationForApp.data?.app.utilization.curr_mem;

	type resourceUsage = {
		readonly timestamp: Date;
		readonly value: number;
	}[];

	function options(data: resourceUsage, request: number, color: string = '#000000'): EChartsOption {
		const dates = data?.map((d) => d.timestamp) || [];
		return {
			tooltip: <EChartsOption['tooltip']>{
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				valueFormatter: (value: number) =>
					value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
			},
			xAxis: <EChartsOption['xAxis']>{
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
			},
			series: <EChartsOption['series']>[
				{
					name: 'Usage',
					type: 'line',
					data: data?.map((d) => d.value) || [],
					color
				},
				{
					name: 'Requested',
					type: 'line',
					data: data?.map(() => request) || [],
					showSymbol: false,
					color: '#C30000'
				}
			],

			yAxis: <EChartsOption['yAxis']>{
				type: 'value',
				name: 'Usage of requested resources',
				axisLabel: {
					formatter: (value: number) => value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
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
					<p class="metric" style="font-size: 1.3rem;">
						{#if curr_cpu && cpuReq}
							{cpuUtilization(cpuReq, curr_cpu)}% of {cpuReq.toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})} cores
						{:else}
							<Skeleton variant="text" width="200px" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard">
				<div class="summaryIcon">
					<MemoryIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current Memory utilization">
							Current memory utilization based on the total memory requested for all instances
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_mem && memoryReq}
							{memoryUtilization(memoryReq, curr_mem)}% of {prettyBytes(memoryReq, {
								locale: 'en',
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						{:else}
							<Skeleton variant="text" width="200px" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard" style="--bg-color: #83bff6">
				<div class="summaryIcon">
					<CostIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>
						Unused CPU cost<HelpText title="Annual cost of unused CPU">
							Estimate of annual cost of unused CPU calculated based on current utilization.
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_cpu && cpuReq}
							€ {yearlyOverageCost(
								UsageResourceType.CPU,
								cpuReq,
								cpuUtilization(cpuReq, curr_cpu)
							).toLocaleString('en-GB', {
								minimumFractionDigits: 2,
								maximumFractionDigits: 2
							})}
						{:else}
							<Skeleton variant="text" width="200px" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4 style="font-size: 0.9rem">
						Unused memory cost<HelpText title="Annual cost of unused memory">
							Estimate of annual cost of unused memory calculated based on current utilization.
						</HelpText>
					</h4>
					<p class="metric">
						{#if curr_mem && memoryReq}
							€ {yearlyOverageCost(
								UsageResourceType.MEMORY,
								memoryReq,
								memoryUtilization(memoryReq, curr_mem)
							).toLocaleString('en-GB', {
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
				<h3 style={'margin-bottom: 0'}>Memory usage</h3>
				<span class="intervalPicker">
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval}
						<a
							class:active={($page.url.searchParams.get('interval') || '7d') == interval}
							href="?interval={interval}">{interval}</a
						>
					{/each}
				</span>
			</span>
			{#if usageRange && memoryReq}
				<EChart
					options={options(
						usageRange.mem.map((d) => {
							return { timestamp: d.timestamp, value: d.value / 1024 / 1024 / 1024 };
						}),
						memoryReq / 1024 / 1024 / 1024,
						'rgb(145, 220, 117)'
					)}
					style="height: 400px"
				/>
			{:else}
				<div class="loading">
					<Skeleton variant={'rectangle'} height="450px" />
				</div>
			{/if}
			<span class="graphHeader">
				<h3 style={'margin-bottom: 0'}>CPU usage</h3>
			</span>
			{#if usageRange && cpuReq}
				<EChart
					options={options(usageRange.cpu, cpuReq, 'rgb(131, 191, 246)')}
					style="height: 400px"
				/>
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
