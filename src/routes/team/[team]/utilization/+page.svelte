<script lang="ts">
	import { goto } from '$app/navigation';
	import { UtilizationResourceType } from '$houdini';
	import UtilizationChart from '$lib/chart/UtilizationChart.svelte';
	import WorkloadLink from '$lib/domain/workload/WorkloadLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import {
		getTeamOverageData,
		round,
		yearlyOverageCost,
		type TeamOverageData
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

	const handleBarClick = (bar: { env: string; name: string }) => {
		goto(`/team/${teamSlug}/${bar.env}/app/${bar.name}/utilization`);
	};
</script>

<GraphErrors errors={$TeamResourceUsage.errors} />
<div class="wrapper">
	{#if resourceUtilization}
		{@const filteredCpuUtil = resourceUtilization.team.cpuUtil.filter(
			(item) => item && item.used < item.requested
		)}
		{@const cpuRequested = filteredCpuUtil.reduce(
			(acc, item) => acc + (item ? item.requested : 0),
			0
		)}
		{@const cpuUsage = filteredCpuUtil.reduce((acc, item) => acc + (item ? item.used : 0), 0)}
		{@const filtertedMemoryUtil = resourceUtilization.team.memUtil.filter(
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
				<Heading as="h2" size="medium" spacing
					><WalletFillIcon class="heading-aligned-icon" /> Cost of Unutilized CPU</Heading
				>
				<BodyShort spacing
					>Estimate of annual cost of unutilized CPU for <strong>{teamSlug}</strong> calculated from current
					utilization data.</BodyShort
				>

				<div class="cost-wrapper">
					<div class="cost-amount">
						{euroValueFormatter(
							round(
								yearlyOverageCost(
									UtilizationResourceType.CPU,
									cpuRequested - cpuUsage,
									resourceUtilization.currentUnitPrices.cpu.value,
									resourceUtilization.currentUnitPrices.memory.value
								),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
			<div class="card">
				<Heading as="h2" size="medium" spacing
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
								yearlyOverageCost(
									UtilizationResourceType.MEMORY,
									memoryRequested - memoryUsage,
									resourceUtilization.currentUnitPrices.cpu.value,
									resourceUtilization.currentUnitPrices.memory.value
								),
								0
							),
							{ maximumFractionDigits: 0 }
						)}
					</div>
				</div>
			</div>
		</div>
		<Heading as="h2">Top Overprovisioned Applications</Heading>
		<BodyLong spacing>
			These charts highlight the applications with the highest unused CPU and memory relative to
			their requested resources. Large gaps may indicate overprovisioning and opportunities to
			reduce infrastructure costs by optimizing resource requests.
		</BodyLong>

		<div class="charts-row">
			<UtilizationChart data={sortedCpuData} format="cpu" onBarClick={handleBarClick} />
			<UtilizationChart data={sortedMemoryData} format="memory" onBarClick={handleBarClick} />
		</div>
		<Heading as="h3" spacing>CPU and Memory Underutilization per Application</Heading>
		<BodyLong spacing>
			This table shows unutilized CPU and memory for each application, along with estimated overage
			costs. Use this overview to identify where you can reduce requests and cut infrastructure
			spending.
		</BodyLong>
		<div class="table-container">
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
		</div>
	{/if}
</div>

<style>
	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-width: 0;
	}
	.grid {
		margin-top: 1rem;
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		min-width: 0;
	}

	.charts-row {
		display: flex;
		height: 21.875rem;
		gap: 5rem;
		padding-left: var(--ax-space-8);
		min-width: 0;
	}
	.card {
		background-color: var(--ax-bg-sunken);
		padding: var(--ax-space-16) var(--ax-space-20);
		border-radius: 12px;
		align-items: stretch;
		min-width: 0;
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

	.table-container {
		max-width: 100%;
		overflow-x: auto;
	}

	@media (max-width: 767px), (max-height: 500px) {
		.grid {
			grid-template-columns: 1fr;
		}

		.charts-row {
			flex-direction: column;
			height: auto;
			gap: var(--ax-space-24);
			padding-left: 0;
			width: 100%;
		}

		.cost-amount {
			font-size: var(--ax-font-size-large);
			padding: var(--ax-space-8) var(--ax-space-20);
		}

		.card :global(h2) {
			white-space: normal;
			overflow-wrap: anywhere;
		}

		.card :global(p) {
			overflow-wrap: anywhere;
		}
	}
</style>
