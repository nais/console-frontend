<script lang="ts">
	import { goto } from '$app/navigation';
	import { PendingValue, UtilizationResourceType } from '$houdini';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import { truncateString } from '$lib/chart/util';
	import Cost from '$lib/components/Cost.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { percentageFormatter } from '$lib/utils/formatters';
	import {
		mergeCalculateAndSortOverageData,
		round,
		yearlyOverageCost,
		type TeamOverageData
	} from '$lib/utils/resources';
	import {
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community/components/Table/index.js';
	import { LineGraphStackedIcon, WalletIcon } from '@nais/ds-svelte-community/icons';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let { teamSlug } = $derived(data);

	type OverageData = {
		readonly workload: {
			readonly name: string;
			readonly environment: {
				readonly name: string;
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
				env: s.workload.environment.name,
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
				env: s.workload.environment.name,
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
</script>

<div class="header">
	<IconWithText text="Resource utilization" icon={LineGraphStackedIcon} size="large" />
</div>

<GraphErrors errors={$TeamResourceUsage.errors} />

<div class="grid">
	{#if resourceUtilization}
		<Card columns={3} borderColor="#83bff6">
			<SummaryCard
				color="blue"
				title="CPU utilization"
				helpTextTitle="Current CPU utilization"
				helpText="Current CPU utilization for team {teamSlug}."
			>
				{#snippet icon({ color })}
					<CpuIcon size="32" {color} />
				{/snippet}
				{#if resourceUtilization !== PendingValue}
					{@const cpuRequested = resourceUtilization.cpuUtil.reduce(
						(acc, item) => acc + (item ? item.requested : 0),
						0
					)}
					{@const cpuUsage = resourceUtilization.cpuUtil.reduce(
						(acc, item) => acc + (item ? item.used : 0),
						0
					)}
					{percentageFormatter(round((cpuUsage / cpuRequested) * 100, 0))} of {round(
						cpuRequested,
						0
					)} cores
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#91dc75">
			<SummaryCard
				color="green"
				title="Memory utilization"
				helpTextTitle="Current memory utilization"
				helpText="Current memory utilization for team {teamSlug}."
			>
				{#snippet icon({ color })}
					<MemoryIcon size="32" {color} />
				{/snippet}
				{#if resourceUtilization !== PendingValue}
					{@const memoryRequested = resourceUtilization.memUtil.reduce(
						(acc, item) => acc + (item ? item.requested : 0),
						0
					)}
					{@const memoryUsage = resourceUtilization.memUtil.reduce(
						(acc, item) => acc + (item ? item.used : 0),
						0
					)}
					{percentageFormatter(round((memoryUsage / memoryRequested) * 100, 0))} of {prettyBytes(
						memoryRequested
					)}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#83bff6">
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
					{@const cpuUsage = filteredCpuUtil.reduce((acc, item) => acc + (item ? item.used : 0), 0)}
					€{round(
						yearlyOverageCost(UtilizationResourceType.CPU, cpuRequested, cpuUsage / cpuRequested),
						0
					)}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3} borderColor="#91dc75">
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
						yearlyOverageCost(
							UtilizationResourceType.MEMORY,
							memoryRequested,
							memoryUsage / memoryRequested
						),
						0
					)}
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={12} borderColor="var(--a-gray-200)">
			<div style="display: flex; justify-content: space-between;">
				<h3>Unused resources per application</h3>
			</div>

			<div style="display: flex">
				{#if resourceUtilization !== PendingValue}
					<EChart
						options={echartOptionsCPUOverageChart(resourceUtilization.cpuUtil)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${teamSlug}/${env}/app/${app}/utilization`);
						}}
					/>
					<EChart
						options={echartOptionsMemoryOverageChart(resourceUtilization.memUtil)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${teamSlug}/${env}/app/${app}/utilization`);
						}}
					/>
				{/if}
			</div>
			<div>
				<h4>All applications</h4>
				<Table
					size={'small'}
					sort={sortState}
					zebraStripes
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
							{#each overageTable as overage}
								<Tr>
									<Td>
										<WorkloadLink
											workload={{
												__typename: overage.type,
												environment: { name: overage.env },
												team: { slug: teamSlug },
												name: overage.name
											}}
											showIcon={true}
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
										<Cost cost={overage.estimatedAnnualOverageCost} />
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
		</Card>
	{/if}
</div>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}
</style>
