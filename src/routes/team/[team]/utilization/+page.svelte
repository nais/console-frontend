<script lang="ts">
	import { goto } from '$app/navigation';
	import { UtilizationResourceType } from '$houdini';
	import UtilizationChart from '$lib/chart/UtilizationChart.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import {
		getTeamOverageData,
		round,
		yearlyOverageCost,
		type TeamOverageData
	} from '$lib/utils/resources';
	import { Table, Tbody, Td, Th, Thead, Tr, type TableSortState } from '@nais/ds-svelte-community';
	import prettyBytes from 'pretty-bytes';
	import type { PageProps } from './$types';

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

	let resourceUtilization = $derived($TeamResourceUsage.data);

	let overageTable: TeamOverageData[] = $derived(
		getTeamOverageData(resourceUtilization, sortState.orderBy, sortState.direction)
	);

	const sortedMemoryData = $derived.by(() => {
		const tmp =
			(resourceUtilization?.team.memUtil.filter((item) => item) as NonNullable<OverageData>[]) ??
			[];
		const overage = tmp
			.map((s) => {
				return {
					key: s.workload.teamEnvironment.environment.name.concat(':').concat(s.workload.name),
					name: s.workload.name,
					env: s.workload.teamEnvironment.environment.name,
					overage: s.requested - s.used > 0 ? s.requested - s.used : 0
				};
			})
			.filter((s) => s.overage > 0);
		return overage.sort((a, b) => b.overage - a.overage).slice(0, 10);
	});

	const sortedCpuData = $derived.by(() => {
		const tmp =
			(resourceUtilization?.team.cpuUtil.filter((item) => item) as NonNullable<OverageData>[]) ??
			[];
		const overage = tmp
			.map((s) => {
				return {
					key: s.workload.teamEnvironment.environment.name.concat(':').concat(s.workload.name),
					name: s.workload.name,
					env: s.workload.teamEnvironment.environment.name,
					overage: s.requested - s.used > 0 ? s.requested - s.used : 0
				};
			})
			.filter((s) => s.overage > 0);
		return overage.sort((a, b) => b.overage - a.overage).slice(0, 10);
	});

	const cpuWaste = $derived.by(() => {
		if (!resourceUtilization) return 0;
		const filtered = resourceUtilization.team.cpuUtil.filter(
			(item) => item && item.used < item.requested
		);
		const requested = filtered.reduce((acc, item) => acc + (item ? item.requested : 0), 0);
		const used = filtered.reduce((acc, item) => acc + (item ? item.used : 0), 0);
		return round(
			yearlyOverageCost(
				UtilizationResourceType.CPU,
				requested - used,
				resourceUtilization.currentUnitPrices.cpu.value,
				resourceUtilization.currentUnitPrices.memory.value
			),
			0
		);
	});

	const memoryWaste = $derived.by(() => {
		if (!resourceUtilization) return 0;
		const filtered = resourceUtilization.team.memUtil.filter(
			(item) => item && item.used < item.requested
		);
		const requested = filtered.reduce((acc, item) => acc + (item ? item.requested : 0), 0);
		const used = filtered.reduce((acc, item) => acc + (item ? item.used : 0), 0);
		return round(
			yearlyOverageCost(
				UtilizationResourceType.MEMORY,
				requested - used,
				resourceUtilization.currentUnitPrices.cpu.value,
				resourceUtilization.currentUnitPrices.memory.value
			),
			0
		);
	});

	const handleBarClick = (bar: { env: string; name: string }) => {
		goto(`/team/${teamSlug}/${bar.env}/app/${bar.name}/utilization`);
	};
</script>

<GraphErrors errors={$TeamResourceUsage.errors} />

{#if resourceUtilization}
	<div class="wrapper">
		<SurfaceCard title="Overprovisioned Applications">
			<div class="resource-grid">
				<div class="resource-column">
					<h3 class="resource-heading">CPU</h3>
					<div class="stat">
						<span class="stat-value"
							>{euroValueFormatter(cpuWaste, { maximumFractionDigits: 0 })}</span
						>
						<span class="stat-label">Estimated annual waste</span>
					</div>
					<div class="charts-row">
						<UtilizationChart data={sortedCpuData} format="cpu" onBarClick={handleBarClick} />
					</div>
				</div>
				<div class="resource-column">
					<h3 class="resource-heading">Memory</h3>
					<div class="stat">
						<span class="stat-value"
							>{euroValueFormatter(memoryWaste, { maximumFractionDigits: 0 })}</span
						>
						<span class="stat-label">Estimated annual waste</span>
					</div>
					<div class="charts-row">
						<UtilizationChart data={sortedMemoryData} format="memory" onBarClick={handleBarClick} />
					</div>
				</div>
			</div>
		</SurfaceCard>

		<SurfaceCard title="Underutilization per Application">
			<div class="table-scroll">
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
							<Th sortable={true} sortKey="COST">Est. annual overage</Th>
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
			</div>
		</SurfaceCard>
	</div>
{/if}

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		min-width: 0;
	}

	.resource-grid {
		display: flex;
		gap: 5rem;
		padding-left: var(--ax-space-8);
		min-width: 0;
	}

	.resource-column {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}

	.resource-column :global(.chart-container) {
		height: 350px;
	}

	.resource-heading {
		font-size: 1rem;
		font-weight: var(--ax-font-weight-bold);
		margin: 0;
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-8) var(--ax-space-16);
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.stat-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	@media (max-width: 767px), (max-height: 500px) {
		.resource-grid {
			flex-direction: column;
			height: auto;
			gap: var(--ax-space-24);
			padding-left: 0;
		}
	}

	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--ax-space-4);
		padding: var(--ax-space-12) var(--ax-space-16);
	}

	.stat-value {
		font-size: 1.75rem;
		font-weight: var(--ax-font-weight-bold);
		color: var(--ax-text-neutral);
	}

	.stat-label {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}

	.charts-row {
		display: flex;
		height: 350px;
		gap: 5rem;
		padding-left: var(--ax-space-8);
		min-width: 0;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.charts-row {
			flex-direction: column;
			height: auto;
			gap: var(--ax-space-24);
			padding-left: 0;
			width: 100%;
		}
	}
</style>
