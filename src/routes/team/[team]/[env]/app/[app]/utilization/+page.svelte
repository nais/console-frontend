<script lang="ts">
	import { page } from '$app/state';
	import EChart from '$lib/chart/EChart.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import type { EChartsOption } from 'echarts';

	import { UtilizationResourceType } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { cpuUtilization, memoryUtilization, yearlyOverageCost } from '$lib/utils/resources';
	import { Heading } from '@nais/ds-svelte-community';
	import { WalletIcon } from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { ResourceUtilizationForApp } = $derived(data);

	type resourceUsage = {
		readonly timestamp: Date;
		readonly value: number;
	}[];

	function options(
		data: resourceUsage,
		request: number,
		limit?: number,
		color: string = '#000000'
	): EChartsOption {
		const safeData = data ?? [];
		const dates = safeData.map((d) =>
			d.timestamp.toLocaleString('en-GB', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		);

		const usageValues = safeData.map((d) => d.value);
		const referenceValues = Array(safeData.length).fill(null);
		const limitValues = limit !== undefined ? Array(safeData.length).fill(limit) : referenceValues;
		const requestValues = Array(safeData.length).fill(request);

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
				data: dates
			},
			series: [
				{
					name: 'Usage',
					type: 'line',
					data: usageValues,
					showSymbol: false,
					color,
					areaStyle: {
						opacity: 0.2
					}
				},
				...(limit !== undefined
					? [
							{
								name: 'Limit',
								type: 'line',
								data: limitValues,
								showSymbol: false,
								color: limitColor,
								markLine: {
									symbol: ['none', 'none'],
									data: [
										{
											yAxis: limit,
											label: {
												formatter: 'Limit',
												position: 'end',
												color: limitColor,
												padding: [2, 5],
												borderRadius: 3
											}
										}
									],
									lineStyle: {
										type: 'solid',
										color: limitColor
									}
								}
							}
						]
					: []),
				{
					name: 'Requested',
					type: 'line',
					data: requestValues,
					showSymbol: false,
					color: requestColor,
					markLine: {
						symbol: ['none', 'none'],
						data: [
							{
								yAxis: request,
								label: {
									formatter: 'Requested',
									position: 'end',
									color: requestColor,
									padding: [2, 5],
									borderRadius: 3
								}
							}
						],
						lineStyle: {
							type: 'solid',
							color: requestColor
						}
					}
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

	const limitColor = '#DE2E2E';
	const usageMemColor = '#8269A2';
	const usageCPUColor = '#FF9100';
	const requestColor = '#3386E0';
</script>

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
				)} CPUs
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
				{(
					memoryUtilization(utilization.requested_memory, utilization.current_memory) * 100
				).toFixed(0)}% of {prettyBytes(utilization.requested_memory, {
					locale: 'en',
					minimumFractionDigits: 2,
					maximumFractionDigits: 2
				})}
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

				{euroValueFormatter(
					yearlyOverageCost(
						UtilizationResourceType.CPU,
						utilization.requested_cpu,
						utilization.current_cpu
					)
				)}
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<SummaryCard
				title="Unused mem cost"
				helpTextTitle="Annual cost of unused memory"
				helpText="Estimate of annual cost of unused memory calculated based on current utilization."
				color="green"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}

				{euroValueFormatter(
					yearlyOverageCost(
						UtilizationResourceType.MEMORY,
						utilization.requested_memory,
						utilization.current_memory
					)
				)}
			</SummaryCard>
		</Card>
	</div>
	<span class="graphHeader">
		<Heading level="2" size="medium">Memory usage</Heading>
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
			utilization.limit_memory ? utilization.limit_memory / 1024 / 1024 / 1024 : undefined,
			usageMemColor
		)}
		style="height: 400px"
	/>

	<span class="graphHeader">
		<Heading level="2" size="medium">CPU usage</Heading>
	</span>
	<EChart
		options={options(
			utilization.cpu_series,
			utilization.requested_cpu,
			utilization.limit_cpu ? utilization.limit_cpu : undefined,
			usageCPUColor
		)}
		style="height: 400px"
	/>
{/if}

<style>
	.grid {
		margin-top: 1rem;
		margin-bottom: var(--a-spacing-6);
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
