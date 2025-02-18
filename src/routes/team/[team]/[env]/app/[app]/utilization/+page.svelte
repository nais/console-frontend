<script lang="ts">
	import { page } from '$app/state';
	import { UtilizationResourceType } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { urlToPageHeader } from '$lib/urlToPageHeader';
	import { cpuUtilization, memoryUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { ResourceUtilizationForApp } = $derived(data);
	export const start = new Date();

	type resourceUsage = {
		readonly timestamp: Date;
		readonly value: number;
	}[];

	function options(data: resourceUsage, request: number, color: string = '#000000'): EChartsOption {
		const dates = data?.map((d) => d.timestamp) || [];
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				valueFormatter: (value: number) =>
					value == null ? '-' : value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
			},
			xAxis: {
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
			series: [
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

			yAxis: {
				type: 'value',
				name: 'Usage of requested resources',
				axisLabel: {
					formatter: (value: number) => value.toLocaleString('en-GB', { maximumFractionDigits: 4 })
				},
				scale: false
			}
		} as EChartsOption;
	}
</script>

<PageHeader {...urlToPageHeader(page.url)} />
<GraphErrors errors={$ResourceUtilizationForApp.errors} />

{#if $ResourceUtilizationForApp.data}
	{@const utilization = $ResourceUtilizationForApp.data.team.environment.application.utilization}

	<div class="grid">
		<Card columns={3} borderColor="#83bff6">
			<SummaryCard
				title="CPU utilization"
				helpTextTitle="Current CPU utilization"
				helpText="Current CPU utilization based on the total cores requested for all instances."
				color="blue"
			>
				{#snippet icon({ color })}
					<CpuIcon size="32" {color} />
				{/snippet}
				{cpuUtilization(utilization.requested_cpu, utilization.current_cpu)}% of {utilization.requested_cpu.toLocaleString(
					'en-GB',
					{
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					}
				)} cores
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<SummaryCard
				title="Memory utilization"
				helpTextTitle="Current Memory utilization"
				helpText="Current memory utilization based on the total memory requested for all instances."
				color="green"
			>
				{#snippet icon({ color })}
					<MemoryIcon size="32" {color} />
				{/snippet}
				{memoryUtilization(utilization.requested_memory, utilization.current_memory)}% of {prettyBytes(
					utilization.requested_memory,
					{
						locale: 'en',
						minimumFractionDigits: 2,
						maximumFractionDigits: 2
					}
				)}
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#83bff6">
			<SummaryCard
				title="Unused CPU cost"
				helpTextTitle="Annual cost of unused CPU"
				helpText="Estimate of annual cost of unused CPU calculated based on current utilization."
				color="blue"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}

				<Cost
					cost={yearlyOverageCost(
						UtilizationResourceType.CPU,
						utilization.requested_cpu,
						cpuUtilization(utilization.requested_cpu, utilization.current_cpu)
					)}
				/>
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<SummaryCard
				title="Unused memory cost"
				helpTextTitle="Annual cost of unused memory"
				helpText="Estimate of annual cost of unused memory calculated based on current utilization."
				color="green"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}
				<Cost
					cost={yearlyOverageCost(
						UtilizationResourceType.MEMORY,
						utilization.requested_memory,
						memoryUtilization(utilization.requested_memory, utilization.current_memory)
					)}
				/>
			</SummaryCard>
		</Card>
		<Card columns={12} borderColor="var(--a-gray-200)">
			<span class="graphHeader">
				<h3 style={'margin-bottom: 0'}>Memory usage</h3>
				<span class="intervalPicker">
					{#each ['1h', '6h', '1d', '7d', '30d'] as interval (interval)}
						<a
							class:active={(page.url.searchParams.get('interval') || '7d') == interval}
							href="?interval={interval}">{interval}</a
						>
					{/each}
				</span>
			</span>
			<EChart
				options={options(
					utilization.memory_series.map((d) => {
						return { timestamp: d.timestamp, value: d.value / 1024 / 1024 / 1024 };
					}),
					utilization.requested_memory / 1024 / 1024 / 1024,
					'rgb(145, 220, 117)'
				)}
				style="height: 400px"
			/>

			<span class="graphHeader">
				<h3 style={'margin-bottom: 0'}>CPU usage</h3>
			</span>
			<EChart
				options={options(utilization.cpu_series, utilization.requested_cpu, 'rgb(131, 191, 246)')}
				style="height: 400px"
			/>
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
