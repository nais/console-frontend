<script lang="ts">
	import { page } from '$app/stores';
	import Card from '$lib/Card.svelte';
	import EChart from '$lib/chart/EChart.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import CpuIcon from '$lib/icons/CpuIcon.svelte';
	import MemoryIcon from '$lib/icons/MemoryIcon.svelte';
	import { euroValueFormatter, percentageFormatter } from '$lib/utils/formatters';
	import {
		Alert,
		HelpText,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import bytes from 'bytes-iec';
	import type { PageData } from './$houdini';

	import { goto } from '$app/navigation';
	import { PendingValue, UsageResourceType } from '$houdini';
	import { truncateString } from '$lib/chart/util';
	import { mergeCalculateAndSortOverageData, round, yearlyOverageCost } from '$lib/utils/resources';
	import type { EChartsOption } from 'echarts';
	import prettyBytes from 'pretty-bytes';

	export let data: PageData;
	$: ({ TeamResourceUsage } = data);

	$: resourceUtilization = $TeamResourceUsage.data?.team;

	$: overageTable = mergeCalculateAndSortOverageData(
		resourceUtilization,
		sortState.orderBy,
		sortState.direction
	);

	$: team = $page.params.team;

	type OverageData = {
		readonly app: {
			readonly name: string;
			readonly env: {
				readonly name: string;
			};
		};
		readonly requested: number;
		readonly used: number;
	};

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
		const overage = input.map((s) => {
			return {
				name: s.app.name,
				env: s.app.env.name,
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
		const overage = input.map((s) => {
			return {
				name: s.app.name,
				env: s.app.env.name,
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

		overageTable = mergeCalculateAndSortOverageData(
			resourceUtilization,
			sortState.orderBy,
			sortState.direction
		);
		return sortState;
	};

	let sortState: TableSortState = {
		orderBy: 'COST',
		direction: 'descending'
	};
</script>

{#if $TeamResourceUsage.errors}
	<Alert variant="error">
		{#each $TeamResourceUsage.errors as error}
			{error.message}
		{/each}
	</Alert>
{/if}
<div class="grid">
	{#if resourceUtilization}
		<Card columns={3} borderColor="#83bff6">
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #83bff6">
					<CpuIcon size="32" color="#83bff6" />
				</div>
				<div class="summary">
					<h4>
						CPU utilization<HelpText title="Current CPU utilization">
							Current CPU utilization for team {team}.
						</HelpText>
					</h4>
					<p class="metric" style="font-size: 1.3rem;">
						{#if resourceUtilization !== PendingValue}
							{@const cpuRequested = resourceUtilization.cpuUtil.reduce(
								(acc, { requested }) => acc + requested,
								0
							)}
							{@const cpuUsage = resourceUtilization.cpuUtil.reduce(
								(acc, { used }) => acc + used,
								0
							)}
							{percentageFormatter(round((cpuUsage / cpuRequested) * 100, 0))} of {round(
								cpuRequested,
								0
							)} cores
						{/if}
					</p>
				</div>
			</div></Card
		>
		<Card columns={3} borderColor="#91dc75">
			<div class="summaryCard" style="--bg-color: #91dc75">
				<div class="summaryIcon">
					<MemoryIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Memory utilization<HelpText title="Current memory utilization"
							>Current memory utilization for team {team}.
						</HelpText>
					</h4>
					<p class="metric">
						{#if resourceUtilization !== PendingValue}
							{@const memoryRequested = resourceUtilization.memUtil.reduce(
								(acc, { requested }) => acc + requested,
								0
							)}
							{@const memoryUsage = resourceUtilization.memUtil.reduce(
								(acc, { used }) => acc + used,
								0
							)}
							{percentageFormatter(round((memoryUsage / memoryRequested) * 100, 0))} of {bytes.format(
								memoryRequested,
								{ decimalPlaces: 2 }
							)}
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
						Unused CPU cost<HelpText title="Annual cost of unused CPU"
							>Estimate of annual cost of unused CPU for team {team} calculated from current utilization
							data.
						</HelpText>
					</h4>
					<p class="metric">
						{#if resourceUtilization !== PendingValue}
							{@const cpuRequested = resourceUtilization.cpuUtil.reduce(
								(acc, { requested }) => acc + requested,
								0
							)}
							{@const cpuUsage = resourceUtilization.cpuUtil.reduce(
								(acc, { used }) => acc + used,
								0
							)}
							€{round(
								yearlyOverageCost(UsageResourceType.CPU, cpuRequested, cpuUsage / cpuRequested),
								0
							)}
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
					<h4>
						Unused memory cost<HelpText placement={'left'} title="Annual cost of unused memory"
							>Estimate of annual cost of unused memory for team {team} calculated from current utilization
							data.
						</HelpText>
					</h4>
					<p class="metric">
						{#if resourceUtilization !== PendingValue}
							{@const memoryRequested = resourceUtilization.memUtil.reduce(
								(acc, { requested }) => acc + requested,
								0
							)}
							{@const memoryUsage = resourceUtilization.memUtil.reduce(
								(acc, { used }) => acc + used,
								0
							)}
							€{round(
								yearlyOverageCost(
									UsageResourceType.MEMORY,
									memoryRequested,
									memoryUsage / memoryRequested
								),
								0
							)}
						{/if}
					</p>
				</div>
			</div></Card
		>
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
							goto(`/team/${team}/${env}/app/${app}/utilization`);
						}}
					/>
					<EChart
						options={echartOptionsMemoryOverageChart(resourceUtilization.memUtil)}
						style="height: 350px; width: 50%;"
						on:click={(e) => {
							const [env, app] = e.detail.name.split(':');
							goto(`/team/${team}/${env}/app/${app}/utilization`);
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
					on:sortChange={(e) => {
						const { key } = e.detail;
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
										<a href={`/team/${team}/${overage.env}/app/${overage.name}/utilization`}>
											{overage.name}
										</a>
									</Td>
									<Td>{overage.env}</Td>
									<Td
										>{overage.unusedCpu.toLocaleString('en-GB', {
											minimumFractionDigits: 2,
											maximumFractionDigits: 2
										})}</Td
									>
									<Td>{prettyBytes(overage.unusedMem)}</Td>
									<Td
										>{overage.estimatedAnnualOverageCost > 0.0
											? euroValueFormatter(overage.estimatedAnnualOverageCost)
											: '€0.00'}</Td
									>
								</Tr>
							{:else}
								<p>No overage data for team {team}</p>
							{/each}
						{/if}
					</Tbody>
				</Table>
			</div>
		</Card>
	{/if}
</div>

<style>
	.grid {
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
		font-size: 1.5rem;
		margin: 0;
	}
	.summaryCard {
		display: flex;
		align-items: center;
		gap: 20px;
	}
</style>
