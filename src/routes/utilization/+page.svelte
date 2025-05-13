<script lang="ts">
	import { goto } from '$app/navigation';
	import { UtilizationResourceType, type TenantUtilization$result } from '$houdini';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { truncateString } from '$lib/chart/util';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		getTeamsOverageData,
		round,
		yearlyOverageCost,
		type TeamsOverageData
	} from '$lib/utils/resources';
	import {
		BodyLong,
		BodyShort,
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { WalletFillIcon } from '@nais/ds-svelte-community/icons';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	type TenantOverageData = {
		team: { slug: string };
		requested: number;
		used: number;
	};

	function mergeAll(data: TenantUtilization$result | null): {
		cpuUtil: TenantOverageData[];
		memUtil: TenantOverageData[];
	} {
		if (!data) {
			return { cpuUtil: [], memUtil: [] };
		}

		return { memUtil: merge(data.memUtil), cpuUtil: merge(data.cpuUtil) };
	}

	function merge(data: TenantOverageData[]) {
		const merged = data.reduce((acc, { team, requested, used }) => {
			const existing = acc.get(team.slug);
			if (existing) {
				existing.requested += requested;
				existing.used += used;
			} else {
				acc.set(team.slug, { team, requested, used });
			}
			return acc;
		}, new Map<string, TenantOverageData>());
		return Array.from(merged.values());
	}

	function echartOptionsCPUOverageChart(data: TenantOverageData[]) {
		const opts = optionsCPU(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsMemoryOverageChart(data: TenantOverageData[]) {
		const opts = optionsMem(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function optionsCPU(input: TenantOverageData[]): EChartsOption {
		const overage = input.map((s) => {
			return {
				team: s.team.slug,
				overage: s.requested - s.used
			};
		});
		const sorted = overage.sort((a, b) => b.overage - a.overage).slice(0, 10);
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				valueFormatter: (value: number) => (value == null ? '0' : value)
			},
			xAxis: {
				type: 'category',
				data: sorted.map((s) => {
					return s.team;
				}),
				axisLabel: {
					rotate: 60,
					formatter: (value: string) => {
						return truncateString(value, 23);
					}
				}
			},
			legend: {
				show: false
			},
			yAxis: {
				type: 'value',
				name: 'CPU'
			},
			series: {
				name: 'Unutilized CPU',
				data: sorted.map((s) => {
					return s.overage.toLocaleString('en-GB', { maximumFractionDigits: 2 });
				}),
				type: 'bar',
				color: '#83bff6'
			}
		} as EChartsOption;
	}

	function optionsMem(input: TenantOverageData[]): EChartsOption {
		const overage = input.map((s) => {
			return {
				team: s.team.slug,
				overage: (s.requested - s.used) / 1024 / 1024 / 1024
			};
		});
		const sorted = overage.sort((a, b) => b.overage - a.overage).slice(0, 10);
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				valueFormatter: (value: number) => prettyBytes(value * 1024 * 1024 * 1024)
			},
			xAxis: {
				type: 'category',
				data: sorted.map((s) => {
					return s.team;
				}),
				axisLabel: {
					rotate: 60,
					formatter: (value: string) => {
						return truncateString(value, 23);
					}
				}
			},
			legend: {
				show: false
			},
			yAxis: {
				type: 'value',
				name: 'Memory'
			},
			series: {
				name: 'Unutilized memory',
				data: sorted.map((s) => {
					return s.overage;
				}),
				type: 'bar',
				color: '#91dc75'
			}
		} as EChartsOption;
	}

	type SortBy = 'TEAM' | 'CPU' | 'MEMORY' | 'COST';

	const sortTable = (key: SortBy, sortState: TableSortState) => {
		if (!sortState) {
			sortState = {
				orderBy: key,
				direction: 'descending'
			};
		} else if (sortState.orderBy === key) {
			if (sortState.direction === 'ascending') {
				sortState.direction = 'descending';
			} else {
				sortState.direction = 'ascending';
			}
		} else {
			sortState.orderBy = key;
			if (key === 'COST') {
				sortState.direction = 'ascending';
			} else {
				sortState.direction = 'descending';
			}
		}

		return sortState;
	};

	let sortState: TableSortState = $state({
		orderBy: 'COST',
		direction: 'descending'
	});
	let { TenantUtilization } = $derived(data);

	let resourceUtilization = $derived(mergeAll($TenantUtilization.data));
	let overageTable: TeamsOverageData[] = $derived(
		getTeamsOverageData($TenantUtilization.data, sortState.orderBy, sortState.direction)
	);

	function handleChartClick(name: string) {
		goto(`/team/${name}/utilization`);
	}
</script>

<div class="container">
	<GraphErrors errors={$TenantUtilization.errors} />
	{#if resourceUtilization}
		<div class="grid">
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized CPU</Heading
				>
				<BodyShort
					>Estimate of annual cost of unutilized CPU for tenant calculated from current utilization
					data.</BodyShort
				>

				{#if resourceUtilization.cpuUtil.length > 0}
					{@const cpuRequested = resourceUtilization.cpuUtil.reduce(
						(acc, { requested }) => acc + requested,
						0
					)}
					{@const cpuUsage = resourceUtilization.cpuUtil.reduce((acc, { used }) => acc + used, 0)}
					<div
						style="display: flex; gap: 1rem; justify-content: center; padding: var(--spacing-layout) 0;"
					>
						<div class="cost-amount">
							{euroValueFormatter(
								round(
									yearlyOverageCost(
										UtilizationResourceType.CPU,
										cpuRequested - cpuUsage,
										$TenantUtilization.data?.currentUnitPrices.cpu.value ?? 0,
										$TenantUtilization.data?.currentUnitPrices.memory.value ?? 0
									),
									0
								),
								{ maximumFractionDigits: 0 }
							)}
						</div>
					</div>
				{/if}
			</div>
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized Memory</Heading
				>
				<BodyShort
					>Estimate of annual cost of unutilized memory for tenant calculated from current
					utilization data.</BodyShort
				>

				{#if resourceUtilization.memUtil.length > 0}
					{@const memoryRequested = resourceUtilization.memUtil.reduce(
						(acc, { requested }) => acc + requested,
						0
					)}
					{@const memoryUsage = resourceUtilization.memUtil.reduce(
						(acc, { used }) => acc + used,
						0
					)}
					<div
						style="display: flex; gap: 1rem; justify-content: center; padding: var(--spacing-layout) 0;"
					>
						<div class="cost-amount">
							{euroValueFormatter(
								yearlyOverageCost(
									UtilizationResourceType.MEMORY,
									memoryRequested - memoryUsage,
									$TenantUtilization.data?.currentUnitPrices.cpu.value ?? 0,
									$TenantUtilization.data?.currentUnitPrices.memory.value ?? 0
								),
								{ maximumFractionDigits: 0 }
							)}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<Heading level="1" size="large">Teams with the Highest CPU and Memory Underutilization</Heading>
		<BodyLong
			>The chart below shows which teams are using less CPU and memory than they requested. While
			resources are allocated based on anticipated needs, consistently underutilized resources
			represent an opportunity for cost optimization. By adjusting resource requests to more
			accurately reflect actual usage, teams can reduce wasteful spending and improve overall
			efficiency.
		</BodyLong>

		<BodyLong>
			Note: The chart only shows the top 10 teams with the highest CPU and memory underutilization.
			For a complete overview of all teams, please refer to the table below.
		</BodyLong>

		<div style="display: flex; ">
			<EChart
				options={echartOptionsCPUOverageChart(resourceUtilization.cpuUtil)}
				style="height: 350px; width: 50%;"
				onclick={handleChartClick}
			/>
			<EChart
				options={echartOptionsMemoryOverageChart(resourceUtilization.memUtil)}
				style="height: 350px; width: 50%;"
				onclick={handleChartClick}
			/>
		</div>

		<BodyLong>
			Click on the bars in the chart to see details about the resource utilization of a specific
			team.
		</BodyLong>

		<div>
			<Heading level="2" spacing>CPU and Memory Underutilization per Team</Heading>

			<Table
				size="small"
				sort={sortState}
				onsortchange={(key) => {
					sortState = sortTable(key as SortBy, sortState);
				}}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey="TEAM">Team</Th>
						<Th sortable={true} sortKey="CPU">Unutilized CPU</Th>
						<Th sortable={true} sortKey="MEMORY">Unutilized memory</Th>
						<Th sortable={true} sortKey="COST">Estimated annual overage cost</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each overageTable as overage (overage)}
						<Tr>
							<Td>
								<a href={`/team/${overage.teamSlug}/utilization`}>
									{overage.teamSlug}
								</a>
							</Td>
							<Td>
								{overage.unusedCpu.toLocaleString('en-GB', {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2
								})}
							</Td>
							<Td>{prettyBytes(overage.unusedMem)}</Td>
							<Td>
								{euroValueFormatter(overage.estimatedAnnualOverageCost)}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No overage data for tenant.</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
		</div>
	{/if}
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
	}
	.cost-amount {
		background-color: var(--ax-bg-raised);
		font-size: 1.5rem;
		padding: 1rem 2rem;
		border-radius: 0.375rem;
		display: inline-block;
		align-items: center;
	}
</style>
