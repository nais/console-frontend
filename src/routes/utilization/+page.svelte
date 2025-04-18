<script lang="ts">
	import { goto } from '$app/navigation';
	import { UtilizationResourceType, type TenantUtilization$result } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { truncateString } from '$lib/chart/util';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		mergeCalculateAndSortOverageDataAllTeams,
		round,
		yearlyOverageCost,
		type TeamsOverageData
	} from '$lib/utils/resources';
	import {
		Heading,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	type TenantOverageData = {
		readonly team: { readonly slug: string };
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

	const sortTable = (key: string, sortState: TableSortState) => {
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
			if (key === 'NAME') {
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
	let overageTable: TeamsOverageData[] = $state([]);
	$effect(() => {
		overageTable = mergeCalculateAndSortOverageDataAllTeams(
			resourceUtilization,
			sortState.orderBy,
			sortState.direction
		);
	});

	function handleChartClick(name: string) {
		goto(`/team/${name}/utilization`);
	}
</script>

<GraphErrors errors={$TenantUtilization.errors} />
<div class="wrapper">
	{#if resourceUtilization}
		<div class="grid">
			<Card columns={3} borderColor="#83bff6">
				<SummaryCard
					color="blue"
					title="Unused CPU cost"
					helpTextTitle="Annual cost of unused CPU"
					helpText="Estimate of annual cost of unused CPU for tenant calculated from current utilization data."
				>
					{#snippet icon({ color })}
						<WalletIcon height="32px" width="32px" {color} />
					{/snippet}
					{#if resourceUtilization.cpuUtil.length > 0}
						{@const cpuRequested = resourceUtilization.cpuUtil.reduce(
							(acc, { requested }) => acc + requested,
							0
						)}
						{@const cpuUsage = resourceUtilization.cpuUtil.reduce((acc, { used }) => acc + used, 0)}
						{euroValueFormatter(
							round(yearlyOverageCost(UtilizationResourceType.CPU, cpuRequested, cpuUsage), 0),
							{ maximumFractionDigits: 0 }
						)}
					{/if}
				</SummaryCard>
			</Card>
			<Card columns={3} borderColor="#91dc75">
				<SummaryCard
					color="green"
					title="Unused memory cost"
					helpTextTitle="Annual cost of unused memory"
					helpText="Estimate of annual cost of unused memory for tenant calculated from current utilization data."
				>
					{#snippet icon({ color })}
						<WalletIcon height="32px" width="32px" {color} />
					{/snippet}
					{#if resourceUtilization.memUtil.length > 0}
						{@const memoryRequested = resourceUtilization.memUtil.reduce(
							(acc, { requested }) => acc + requested,
							0
						)}
						{@const memoryUsage = resourceUtilization.memUtil.reduce(
							(acc, { used }) => acc + used,
							0
						)}
						{euroValueFormatter(
							yearlyOverageCost(UtilizationResourceType.MEMORY, memoryRequested, memoryUsage),
							{ maximumFractionDigits: 0 }
						)}
					{/if}
				</SummaryCard>
			</Card>
		</div>

		<Heading level="1" size="large">Top 10 Unused Resources per Team</Heading>

		<div style="display: flex">
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
		<div>
			<Heading level="2" spacing>All Teams</Heading>
			<Table
				size="small"
				sort={sortState}
				onsortchange={(key) => {
					sortState = sortTable(key, sortState);
				}}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey="TEAM">Team</Th>
						<Th sortable={true} sortKey="CPU">Unused CPU</Th>
						<Th sortable={true} sortKey="MEMORY">Unused memory</Th>
						<Th sortable={true} sortKey="COST">Estimated annual overage cost</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#each overageTable as overage (overage)}
						<Tr>
							<Td>
								<a href={`/team/${overage.team}/utilization`}>
									{overage.team}
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
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
	}
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
