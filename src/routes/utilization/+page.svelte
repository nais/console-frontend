<script lang="ts">
	import { goto } from '$app/navigation';
	import { UtilizationResourceType, type TenantUtilization$result } from '$houdini';
	import UtilizationChart from '$lib/chart/UtilizationChart.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import {
		getTeamsOverageData,
		round,
		yearlyOverageCost,
		type TeamsOverageData
	} from '$lib/utils/resources';
	import {
		BodyLong,
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

	const pageSize = 25;
	let currentPage = $state(0);

	const paginatedTable = $derived(
		overageTable.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
	);
	const totalCount = $derived(overageTable.length);
	const pageStart = $derived(totalCount > 0 ? currentPage * pageSize + 1 : 0);
	const pageEnd = $derived(Math.min((currentPage + 1) * pageSize, totalCount));

	const sortedMemoryData = $derived.by(() => {
		const tmp =
			(resourceUtilization?.memUtil.filter((item) => item) as NonNullable<TenantOverageData>[]) ??
			[];
		const overage = tmp
			.map((s) => {
				return {
					key: s.team.slug,
					overage: s.requested - s.used > 0 ? s.requested - s.used : 0
				};
			})
			.filter((s) => s.overage > 0);
		return overage.sort((a, b) => b.overage - a.overage).slice(0, 10);
	});

	const sortedCpuData = $derived.by(() => {
		const tmp =
			(resourceUtilization?.cpuUtil.filter((item) => item) as NonNullable<TenantOverageData>[]) ??
			[];
		const overage = tmp
			.map((s) => {
				return {
					key: s.team.slug,
					overage: s.requested - s.used > 0 ? s.requested - s.used : 0
				};
			})
			.filter((s) => s.overage > 0);
		return overage.sort((a, b) => b.overage - a.overage).slice(0, 10);
	});

	function handleBarClick({ key }: { key: string }) {
		goto(`/team/${key}/utilization`);
	}
</script>

<div class="page">
	<div class="container">
		<Heading as="h1" size="large">Tenant Utilization</Heading>
		<GraphErrors errors={$TenantUtilization.errors} />
		{#if resourceUtilization}
			<div class="resource-grid">
				<SurfaceCard title="Estimated annual CPU waste" level="h2" bordered>
					<p>
						Estimate of annual cost of unutilized CPU for tenant calculated from current utilization
						data.
					</p>
					{#if resourceUtilization.cpuUtil.length > 0}
						{@const cpuRequested = resourceUtilization.cpuUtil.reduce(
							(acc, { requested }) => acc + requested,
							0
						)}
						{@const cpuUsage = resourceUtilization.cpuUtil.reduce((acc, { used }) => acc + used, 0)}
						<div class="cost-wrapper">
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
				</SurfaceCard>
				<SurfaceCard title="Estimated annual memory waste" level="h2" bordered>
					<p>
						Estimate of annual cost of unutilized memory for tenant calculated from current
						utilization data.
					</p>
					{#if resourceUtilization.memUtil.length > 0}
						{@const memoryRequested = resourceUtilization.memUtil.reduce(
							(acc, { requested }) => acc + requested,
							0
						)}
						{@const memoryUsage = resourceUtilization.memUtil.reduce(
							(acc, { used }) => acc + used,
							0
						)}
						<div class="cost-wrapper">
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
				</SurfaceCard>
			</div>

			<section aria-labelledby="top-teams-heading">
				<Heading as="h2" spacing id="top-teams-heading"
					>Teams with the Highest CPU and Memory Underutilization</Heading
				>
				<BodyLong
					>The chart below shows which teams are using less CPU and memory than they requested.
					While resources are allocated based on anticipated needs, consistently underutilized
					resources represent an opportunity for cost optimization. By adjusting resource requests
					to more accurately reflect actual usage, teams can reduce wasteful spending and improve
					overall efficiency.
				</BodyLong>

				<BodyLong>
					Note: The chart only shows the top 10 teams with the highest CPU and memory
					underutilization. For a complete overview of all teams, please refer to the table below.
				</BodyLong>

				<div class="chart-row">
					<UtilizationChart data={sortedCpuData} format="cpu" onBarClick={handleBarClick} />
					<UtilizationChart data={sortedMemoryData} format="memory" onBarClick={handleBarClick} />
				</div>
			</section>

			<section aria-labelledby="underutilization-heading">
				<Heading as="h2" spacing id="underutilization-heading"
					>CPU and Memory Underutilization per Team</Heading
				>

				<div
					class="table-scroll"
					role="region"
					aria-label="CPU and memory underutilization per team"
				>
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
							{#each paginatedTable as overage (overage)}
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
				<Pagination
					page={{
						hasNextPage: pageEnd < totalCount,
						hasPreviousPage: currentPage > 0,
						pageStart,
						pageEnd,
						totalCount
					}}
					loaders={{
						loadNextPage: () => {
							currentPage += 1;
						},
						loadPreviousPage: () => {
							currentPage -= 1;
						}
					}}
				/>
			</section>
		{/if}
	</div>
</div>

<style>
	.container {
		margin-top: var(--spacing-layout);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-layout);
		min-width: 0;
	}
	.resource-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--ax-space-16);
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
		padding: var(--ax-space-16) var(--ax-space-32);
		border-radius: var(--ax-radius-8);
		display: inline-block;
		align-items: center;
	}

	.chart-row {
		display: flex;
		height: 350px;
	}

	/* Mobile responsive styles */
	@media (max-width: 767px) {
		.container {
			gap: var(--ax-space-16);
			margin-top: var(--ax-space-16);
		}

		.resource-grid {
			grid-template-columns: 1fr;
		}

		.cost-amount {
			padding: var(--ax-space-8) var(--ax-space-12);
			font-size: var(--ax-font-size-large);
		}
	}
</style>
