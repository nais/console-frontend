<script lang="ts">
	import { goto } from '$app/navigation';
	import { PendingValue, UtilizationResourceType } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { truncateString } from '$lib/chart/util';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		mergeCalculateAndSortOverageData,
		round,
		yearlyOverageCost,
		type TeamOverageData
	} from '$lib/utils/resources';
	import { Heading } from '@nais/ds-svelte-community';
	import {
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community/components/Table/index.js';
	import { WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();
	let { teamSlug } = $derived(data);

	type OverageData = {
		readonly workload: {
			readonly name: string;
			readonly teamEnvironment: {
				readonly environment: {
					readonly name: string;
				};
			};
		};
		readonly requested: number;
		readonly used: number;
	} | null;

	function echartOptionsCPUOverageChart(data: OverageData[]) {
		const opts = optionsCPU(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function echartOptionsMemoryOverageChart(data: OverageData[]) {
		const opts = optionsMem(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function optionsCPU(input: OverageData[]): EChartsOption {
		const tmp = input.filter((item) => item) as NonNullable<OverageData>[];
		const overage = tmp.map((s) => {
			return {
				name: s.workload.name,
				env: s.workload.teamEnvironment.environment.name,
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
					return s.env.concat(':').concat(s.name);
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

	function optionsMem(input: OverageData[]): EChartsOption {
		const tmp = input.filter((item) => item) as NonNullable<OverageData>[];
		const overage = tmp.map((s) => {
			return {
				name: s.workload.name,
				env: s.workload.teamEnvironment.environment.name,
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
				valueFormatter: prettyBytes
			},
			xAxis: {
				type: 'category',
				data: sorted.map((s) => {
					return s.env.concat(':').concat(s.name);
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
				name: 'Memory',

				axisLabel: {
					formatter: prettyBytes
				}
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

		overageTable = mergeCalculateAndSortOverageData(
			resourceUtilization,
			sortState.orderBy,
			sortState.direction
		);
		return sortState;
	};

	let sortState: TableSortState = $state({
		orderBy: 'COST',
		direction: 'descending'
	});
	let { TeamResourceUsage } = $derived(data);
	let resourceUtilization = $derived($TeamResourceUsage.data?.team);
	let overageTable: TeamOverageData[] = $state([]);

	$effect(() => {
		overageTable = mergeCalculateAndSortOverageData(
			resourceUtilization,
			sortState.orderBy,
			sortState.direction
		);
	});

	function handleChartClick(name: string) {
		const [env, app] = name.split(':');
		goto(`/team/${teamSlug}/${env}/app/${app}/utilization`);
	}
</script>

<GraphErrors errors={$TeamResourceUsage.errors} />
<div class="wrapper">
	{#if resourceUtilization}
		<div class="grid">
			<Card columns={4} borderColor="#83bff6">
				<SummaryCard
					color="blue"
					title="Unused CPU cost"
					helpTextTitle="Annual cost of unused CPU"
					helpText="Estimate of annual cost of unused CPU for team {teamSlug} calculated from current utilization
							data."
				>
					{#snippet icon({ color })}
						<WalletIcon height="32px" width="32px" {color} />
					{/snippet}
					{#if resourceUtilization !== PendingValue}
						{@const filteredCpuUtil = resourceUtilization.cpuUtil.filter(
							(item) => item && item.used < item.requested
						)}
						{@const cpuRequested = filteredCpuUtil.reduce(
							(acc, item) => acc + (item ? item.requested : 0),
							0
						)}
						{@const cpuUsage = filteredCpuUtil.reduce(
							(acc, item) => acc + (item ? item.used : 0),
							0
						)}
						€{round(yearlyOverageCost(UtilizationResourceType.CPU, cpuRequested, cpuUsage), 0)}
					{/if}
				</SummaryCard>
			</Card>
			<Card columns={4} borderColor="#91dc75">
				<SummaryCard
					color="green"
					title="Unused memory cost"
					helpTextTitle="Annual cost of unused memory"
					helpText="Estimate of annual cost of unused memory for team {teamSlug} calculated from current utilization
							data."
				>
					{#snippet icon({ color })}
						<WalletIcon height="32px" width="32px" {color} />
					{/snippet}
					{#if resourceUtilization !== PendingValue}
						{@const filtertedMemoryUtil = resourceUtilization.memUtil.filter(
							(item) => item && item.used < item.requested
						)}
						{@const memoryRequested = filtertedMemoryUtil.reduce(
							(acc, item) => acc + (item ? item.requested : 0),
							0
						)}
						{@const memoryUsage = filtertedMemoryUtil.reduce(
							(acc, item) => acc + (item ? item.used : 0),
							0
						)}
						€{round(
							yearlyOverageCost(UtilizationResourceType.MEMORY, memoryRequested, memoryUsage),
							0
						)}
					{/if}
				</SummaryCard>
			</Card>
		</div>
		<div style="display: flex; justify-content: space-between;">
			<Heading level="2">Top 10 Unused Resources per Application</Heading>
		</div>

		<div style="display: flex">
			{#if resourceUtilization !== PendingValue}
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
			{/if}
		</div>
		<div>
			<Heading level="3" spacing>Unused Resources for All Applications</Heading>
			<Table
				size="small"
				sort={sortState}
				onsortchange={(key) => {
					sortState = sortTable(key, sortState);
				}}
			>
				<Thead>
					<Tr>
						<Th sortable={true} sortKey="APPLICATION">Application</Th>
						<Th sortable={true} sortKey="ENVIRONMENT">Environment</Th>
						<Th sortable={true} sortKey="CPU">Unused CPU</Th>
						<Th sortable={true} sortKey="MEMORY">Unused memory</Th>
						<Th sortable={true} sortKey="COST">Estimated annual overage cost</Th>
					</Tr>
				</Thead>
				<Tbody>
					{#if resourceUtilization !== PendingValue}
						{#each overageTable as overage (overage.id)}
							<Tr>
								<Td>
									<WorkloadLink
										workload={{
											__typename: overage.type,
											teamEnvironment: { environment: { name: overage.env } },
											team: { slug: teamSlug },
											name: overage.name
										}}
									/>
								</Td>
								<Td>{overage.env}</Td>
								<Td
									>{overage.unusedCpu.toLocaleString('en-GB', {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2
									})}</Td
								>
								<Td>{prettyBytes(overage.unusedMem)}</Td>
								<Td>
									{euroValueFormatter(overage.estimatedAnnualOverageCost)}
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}>No overage data for team {teamSlug}</Td>
							</Tr>
						{/each}
					{/if}
				</Tbody>
			</Table>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
