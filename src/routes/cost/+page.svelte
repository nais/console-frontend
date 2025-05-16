<script lang="ts">
	import type { TenantCost$result } from '$houdini';
	import { euroValueFormatter } from '$lib/chart/cost_transformer';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import {
		Loader,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import type { PageProps } from './$houdini';
	import EChart from '$lib/chart/EChart.svelte';
	import { goto } from '$app/navigation';
	import type { EChartsOption } from 'echarts';
	import { truncateString } from '$lib/chart/util';

	let { data }: PageProps = $props();
	let tenantCost = $derived(data.TenantCost);
	let services = new Map<string, string>();
	type TeamData = {
		slug: string;
		services: {
			[service: string]: {
				cost: number;
			};
		};
		sum: number;
	};

	let sortState: TableSortState = $state({
		orderBy: 'SUM',
		direction: 'descending'
	});

	// Extract services from the tenant cost data
	$tenantCost.data?.teams.nodes.forEach((team: TenantCost$result['teams']['nodes'][0]) => {
		team.cost.daily.series.forEach((day) => {
			day.services.forEach((service) => {
				services.set(service.service.toUpperCase(), service.service);
			});
		});
	});

	type SortBy = 'SUM' | 'TEAM' | string;

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
			if (sortState.direction === 'ascending') {
				sortState.direction = 'descending';
			} else {
				sortState.direction = 'ascending';
			}
		}

		return sortState;
	};

	function mapTeamsToTeamData(teams: TenantCost$result['teams']['nodes']): TeamData[] {
		return teams.map((team) => {
			return {
				slug: team.slug,
				sum: team.cost.daily.series.reduce((acc, day) => acc + day.sum, 0),
				services: team.cost.daily.series.reduce(
					(acc, day) => {
						day.services.forEach((service) => {
							const name = service.service.toUpperCase();
							if (!acc[name]) {
								acc[name] = { cost: 0 };
							}
							acc[name].cost += service.cost;
						});
						return acc;
					},
					{} as { [service: string]: { cost: number } }
				)
			};
		});
	}

	function sortTeamData(teams: TeamData[], sortState: TableSortState): TeamData[] {
		return [...teams].sort((a, b) => {
			if (sortState.orderBy === 'SUM') {
				return sortState.direction === 'ascending' ? a.sum - b.sum : b.sum - a.sum;
			} else if (sortState.orderBy === 'TEAM') {
				return sortState.direction === 'ascending'
					? a.slug.localeCompare(b.slug)
					: b.slug.localeCompare(a.slug);
			} else {
				const aCost = a.services[sortState.orderBy]?.cost ?? -1;
				const bCost = b.services[sortState.orderBy]?.cost ?? -1;

				return sortState.direction === 'ascending' ? aCost - bCost : bCost - aCost;
			}
		});
	}

	let teamData = $derived(mapTeamsToTeamData($tenantCost.data?.teams.nodes || []));

	let sortedTeamData = $derived(sortTeamData(teamData, sortState));

	function handleChartClick(name: string) {
		goto(`/team/${name}/cost`);
	}

	function echartOptionsCost(data: TeamData[]) {
		const opts = optionsMem(data);
		opts.height = '150px';
		opts.legend = { ...opts.legend, bottom: 20 };
		return opts;
	}

	function optionsMem(data: TeamData[]): EChartsOption {
		const overage = data.map((t) => {
			return {
				team: t.slug,
				sum: t.sum
			};
		});
		const sorted = overage.sort((a, b) => b.sum - a.sum).slice(0, 20);
		return {
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'line'
				},
				valueFormatter: (value: number) => euroValueFormatter(value)
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
				name: 'Cost'
			},
			series: {
				name: 'Total cost',
				data: sorted.map((s) => {
					return s.sum;
				}),
				type: 'bar',
				color: '#91dc75'
			}
		} as EChartsOption;
	}
</script>

<div class="container">
	<GraphErrors errors={$tenantCost.errors} />

	{#if $tenantCost.data}
		<EChart options={echartOptionsCost(teamData)} onclick={handleChartClick} />
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
					{#each services as service (service)}
						<Th sortable={true} sortKey={service[0]}>{service[1]}</Th>
					{/each}
					<Th sortable={true} sortKey="SUM">Sum</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each sortedTeamData as team (team)}
					<Tr>
						<Td>{team.slug}</Td>
						{#each services as service (service)}
							<Td
								>{team.services[service[0]]?.cost
									? euroValueFormatter(team.services[service[0]]?.cost)
									: '-'}</Td
							>
						{/each}
						<Td>{euroValueFormatter(team.sum)}</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
	{:else}
		<div style="display: flex; justify-content: center; align-items: center; height: 500px;">
			<Loader size="3xlarge" />
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
</style>
