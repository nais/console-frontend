<script lang="ts">
	import { PendingValue, SqlInstanceOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tooltip, Tr } from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		DatabaseIcon,
		ExclamationmarkTriangleFillIcon,
		WalletIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';

	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import Cost from '$lib/components/Cost.svelte';
	import IconWithText from '$lib/components/IconWithText.svelte';
	import PersistenceLink from '$lib/components/PersistenceLink.svelte';
	import SummaryCard from '$lib/components/SummaryCard.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { SqlInstances } = $derived(data);

	let tableSort = $derived({
		orderBy: $SqlInstances.variables?.orderBy?.field,
		direction: $SqlInstances.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = SqlInstanceOrderField[key as keyof typeof SqlInstanceOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || SqlInstanceOrderField.NAME
		});
	};
</script>

<GraphErrors errors={$SqlInstances.errors} />

<div class="header">
	<IconWithText icon={DatabaseIcon} text="SQL instances" size="large" />
</div>
{#if $SqlInstances.data}
	{@const cost = $SqlInstances.data.team.cost}
	{@const instances = $SqlInstances.data.team.sqlInstances}
	{@const utilization = $SqlInstances.data.team.serviceUtilization}

	<div class="summary-grid">
		<Card columns={3}>
			<SummaryCard
				title="Cost"
				helpText="Total SQL instance cost for the last 30 days"
				color="green"
			>
				{#snippet icon({ color })}
					<WalletIcon height="32px" width="32px" {color} />
				{/snippet}
				{#if cost !== PendingValue}
					<Cost cost={cost.daily.sum} />
				{:else}
					<Skeleton variant="text" />
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="CPU utilization"
				helpText="Current CPU utilization"
				color="blue"
				styled={false}
			>
				{#snippet icon()}
					{#if utilization.sqlInstances !== PendingValue}
						<CircleProgressBar progress={utilization.sqlInstances.cpu.utilization} />
					{:else}
						<Skeleton height="50px" width="50px" variant="circle" />
					{/if}
				{/snippet}

				{#if utilization.sqlInstances !== PendingValue}
					{(utilization.sqlInstances.cpu.utilization * 100).toFixed(1)}% of
					{utilization.sqlInstances.cpu.requested.toFixed(0)} core{utilization.sqlInstances.cpu
						.requested > 1
						? 's'
						: ''}
				{:else}
					<Skeleton variant="text" />
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="Memory utilization"
				helpText="Memory utilization for the last elapsed hour."
				color="blue"
				styled={false}
			>
				{#snippet icon()}
					{#if utilization.sqlInstances !== PendingValue}
						<CircleProgressBar progress={utilization.sqlInstances.memory.utilization} />
					{:else}
						<Skeleton height="50px" width="50px" variant="circle" />
					{/if}
				{/snippet}

				{#if utilization.sqlInstances !== PendingValue}
					{(utilization.sqlInstances.memory.utilization * 100).toFixed(1)}% of
					{prettyBytes(utilization.sqlInstances.memory.requested)}
				{:else}
					<Skeleton variant="text" />
				{/if}
			</SummaryCard>
		</Card>
		<Card columns={3}>
			<SummaryCard
				title="Disk utilization"
				helpText="Disk utilization for the last elapsed hour."
				color="blue"
				styled={false}
			>
				{#snippet icon()}
					{#if utilization.sqlInstances !== PendingValue}
						<CircleProgressBar progress={utilization.sqlInstances.disk.utilization} />
					{:else}
						<Skeleton height="50px" width="50px" variant="circle" />
					{/if}
				{/snippet}

				{#if utilization.sqlInstances !== PendingValue}
					{(utilization.sqlInstances.disk.utilization * 100).toFixed(1)}% of
					{prettyBytes(utilization.sqlInstances.disk.requested)}
				{:else}
					<Skeleton variant="text" />
				{/if}
			</SummaryCard>
		</Card>
	</div>
	<Card columns={12}>
		<Table
			zebraStripes
			size="small"
			sort={{
				orderBy: tableSort.orderBy || SqlInstanceOrderField.NAME,
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			onsortchange={tableSortChange}
		>
			<Thead>
				<Tr>
					<Th style="width: 2rem"></Th>
					<Th sortable={true} sortKey={SqlInstanceOrderField.NAME}>Name</Th>
					<Th sortable={true} sortKey={SqlInstanceOrderField.VERSION}>Version</Th>
					<Th sortable={true} sortKey={SqlInstanceOrderField.ENVIRONMENT}>Environment</Th>
					<Th sortable={true} sortKey={SqlInstanceOrderField.STATUS}>Status</Th>
					<Th sortable={true} sortKey={SqlInstanceOrderField.COST}>Cost</Th>
					<Th sortable={true} sortKey={SqlInstanceOrderField.CPU_UTILIZATION}
						><Tooltip content="CPU utilization for the last elapsed hour">CPU</Tooltip></Th
					>
					<Th sortable={true} sortKey={SqlInstanceOrderField.MEMORY_UTILIZATION}
						><Tooltip content="Memory utilization for the last elapsed hour">Memory</Tooltip></Th
					>
					<Th sortable={true} sortKey={SqlInstanceOrderField.DISK_UTILIZATION}
						><Tooltip content="Disk utilization for the last elapsed hour">Disk</Tooltip></Th
					>
				</Tr>
			</Thead>
			<Tbody>
				{#each instances.nodes as i}
					{#if i !== PendingValue}
						<Tr>
							<Td>
								{#if !i.workload?.name}
									<Tooltip content="The SQL instance does not belong to any workload">
										<ExclamationmarkTriangleFillIcon
											style="color: var(--a-icon-warning)"
											title="The SQL instance does not belong to any workload"
										/>
									</Tooltip>
								{/if}
							</Td>
							<Td>
								<PersistenceLink instance={i} />
							</Td>
							<Td>
								{i.version}
							</Td>
							<Td>
								{i.environment.name}
							</Td>

							<Td>
								{#if i.state === 'RUNNABLE'}
									<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
								{:else}
									<Tooltip content="Unhealthy state: {i.state}" placement="right">
										<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
									</Tooltip>
								{/if}
							</Td>
							<Td>
								{#if i.cost.sum > 0}
									€{Math.round(i.cost.sum)}
								{:else}
									-
								{/if}
							</Td>
							<Td>
								{#if i.metrics.cpu.utilization}
									<span
										title="{i.metrics.cpu.utilization.toFixed(1)}% of {i.metrics.cpu.cores} core{i
											.metrics.cpu.cores > 1
											? 's'
											: ''}"
									>
										{i.metrics.cpu.utilization.toFixed(1)}%
									</span>
								{/if}
							</Td>
							<Td>
								{#if i.metrics.memory.utilization}
									<span
										title="{i.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
											i.metrics.memory.quotaBytes
										)}"
									>
										{i.metrics.memory.utilization.toFixed(1)}%
									</span>
								{/if}
							</Td>
							<Td>
								{#if i.metrics.disk.utilization}
									<span
										title="{i.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
											i.metrics.disk.quotaBytes
										)}"
									>
										{i.metrics.disk.utilization.toFixed(1)}%
									</span>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
							<Td>
								<Skeleton variant="text" />
							</Td>
						</Tr>
					{/if}
				{:else}
					<Tr>
						<Td colspan={999}>No SQL instances found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		{#if instances.pageInfo !== PendingValue}
			{#if instances.pageInfo.hasPreviousPage || instances.pageInfo.hasNextPage}
				<Pagination
					page={instances.pageInfo}
					loaders={{
						loadPreviousPage: () => SqlInstances.loadPreviousPage(),
						loadNextPage: () => SqlInstances.loadNextPage()
					}}
				/>
			{/if}
		{/if}
	</Card>
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		align-self: stretch;
		margin-bottom: var(--a-spacing-3);
	}
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}
</style>
