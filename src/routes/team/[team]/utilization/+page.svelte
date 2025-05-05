<script lang="ts">
	import { goto } from '$app/navigation';
	import { UtilizationResourceType } from '$houdini';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import EChart from '$lib/chart/EChart.svelte';
	import { truncateString } from '$lib/chart/util';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		getTeamOverageData,
		round,
		yearlyOverageCost,
		type TeamOverageData
	} from '$lib/utils/resources';
	import { BodyLong, BodyShort, Heading } from '@nais/ds-svelte-community';
	import {
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community/components/Table/index.js';
	import { WalletFillIcon } from '@nais/ds-svelte-community/icons';
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

		overageTable = getTeamOverageData(resourceUtilization, sortState.orderBy, sortState.direction);
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
		overageTable = getTeamOverageData(resourceUtilization, sortState.orderBy, sortState.direction);
	});

	function handleChartClick(name: string) {
		const [env, app] = name.split(':');
		goto(`/team/${teamSlug}/${env}/app/${app}/utilization`);
	}
</script>

<GraphErrors errors={$TeamResourceUsage.errors} />
<div class="wrapper">
	{#if resourceUtilization}
		{@const filteredCpuUtil = resourceUtilization.cpuUtil.filter(
			(item) => item && item.used < item.requested
		)}
		{@const cpuRequested = filteredCpuUtil.reduce(
			(acc, item) => acc + (item ? item.requested : 0),
			0
		)}
		{@const cpuUsage = filteredCpuUtil.reduce((acc, item) => acc + (item ? item.used : 0), 0)}
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
		<div class="grid">
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized CPU</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized CPU for <strong>{teamSlug}</strong> calculated from
					current utilization data.</BodyShort
				>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(yearlyOverageCost(UtilizationResourceType.CPU, cpuRequested - cpuUsage), 0),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
			<div class="card">
				<Heading level="2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized Memory</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized memory for <strong>{teamSlug}</strong> calculated from
					current utilization data.</BodyShort
				>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(
								yearlyOverageCost(UtilizationResourceType.MEMORY, memoryRequested - memoryUsage),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
		</div>
		<Heading level="2">Top 10 Overprovisioned Applications</Heading>
		<BodyLong spacing>
			These charts highlight the 10 applications with the highest unused CPU and memory relative to
			their requested resources. Large gaps may indicate overprovisioning and opportunities to
			reduce infrastructure costs by optimizing resource requests.
		</BodyLong>

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
		<Heading level="3" spacing>Resource Waste Across All Applications</Heading>
		<BodyLong spacing>
			This table shows unutilized CPU and memory for each application, along with estimated overage
			costs. Use this overview to identify where you can reduce requests and cut infrastructure
			spending.
		</BodyLong>
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
					<Th sortable={true} sortKey="CPU">Unutilized CPU</Th>
					<Th sortable={true} sortKey="MEMORY">Unutilized memory</Th>
					<Th sortable={true} sortKey="COST">Estimated annual overage cost</Th>
				</Tr>
			</Thead>
			<Tbody>
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
			</Tbody>
		</Table>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
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

	.cost-wrapper {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.cost-amount {
		background-color: var(--ax-bg-raised);
		font-size: 1.5rem;
		border-radius: 0.375rem;
		display: inline-block;
		align-items: center;
		padding: var(--ax-space-8) var(--ax-space-32);
	}
</style>
