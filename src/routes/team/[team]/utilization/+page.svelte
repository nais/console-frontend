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
	<div class="content">
		<section aria-labelledby="overprovisioned-heading">
			<Heading as="h2" size="medium" id="overprovisioned-heading"
				>Overprovisioned Applications</Heading
			>
			<div class="resource-grid">
				<SurfaceCard title="Estimated annual CPU waste" level="h3" bordered>
					<div class="cost-wrapper">
						<div class="cost-amount">
							{euroValueFormatter(cpuWaste, { maximumFractionDigits: 0 })}
						</div>
					</div>
					<div class="chart">
						<UtilizationChart data={sortedCpuData} format="cpu" onBarClick={handleBarClick} />
					</div>
				</SurfaceCard>
				<SurfaceCard title="Estimated annual memory waste" level="h3" bordered>
					<div class="cost-wrapper">
						<div class="cost-amount">
							{euroValueFormatter(memoryWaste, { maximumFractionDigits: 0 })}
						</div>
					</div>
					<div class="chart">
						<UtilizationChart data={sortedMemoryData} format="memory" onBarClick={handleBarClick} />
					</div>
				</SurfaceCard>
			</div>
		</section>

		<section aria-labelledby="underutilization-heading">
			<Heading as="h2" size="medium" id="underutilization-heading"
				>Underutilization per Application</Heading
			>
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
										hideTeam
										hideEnv
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
		</section>
	</div>
{/if}

<style>
	.content {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-32);
		min-width: 0;
	}

	.resource-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--ax-space-16);
		margin-top: var(--ax-space-16);
		min-width: 0;
	}

	.cost-wrapper {
		display: flex;
		gap: var(--ax-space-16);
		justify-content: center;
	}

	.cost-amount {
		background-color: var(--ax-bg-raised);
		font-size: var(--ax-font-size-xlarge);
		border-radius: var(--ax-radius-4);
		display: inline-block;
		align-items: center;
		padding: var(--ax-space-8) var(--ax-space-32);
	}

	.chart {
		height: 350px;
		min-width: 0;
		margin-top: var(--ax-space-16);
	}

	@media (max-width: 767px) {
		.resource-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
