<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, SqlInstanceOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		Alert,
		Button,
		HelpText,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		CheckmarkIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		ExclamationmarkTriangleFillIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';

	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import { euroValueFormatter } from '$lib/utils/formatters';
	import { changeParams } from '$lib/utils/searchparams';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ SqlInstances } = data);

	$: tableSort = {
		orderBy: $SqlInstances.variables?.orderBy?.field,
		direction: $SqlInstances.variables?.orderBy?.direction
	};

	const tableSortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
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

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstances.errors}
	{#each distinctErrors($SqlInstances.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{/if}
{#if $SqlInstances.data}
	{@const cost = $SqlInstances.data.team.cost}
	{@const instances = $SqlInstances.data.team.sqlInstances}
	{@const utilization = $SqlInstances.data.team.serviceUtilization}

	<div class="summary-grid">
		<Card columns={3}>
			<div class="summaryCard">
				<div class="summaryIcon" style="--bg-color: #91dc75">
					<CostIcon size="32" color="#91dc75" />
				</div>
				<div class="summary">
					<h4>
						Cost
						<HelpText title="">Total SQL instance cost for the last 30 days.</HelpText>
					</h4>
					<p class="metric">
						{#if cost !== PendingValue}
							{euroValueFormatter(cost.daily.sum)}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if utilization.sqlInstances !== PendingValue}
						<CircleProgressBar progress={utilization.sqlInstances.cpu.utilization} />
					{:else}
						<Skeleton height="50px" width="50px" variant="circle" />
					{/if}
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization">
							CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{#if utilization.sqlInstances !== PendingValue}
							{(utilization.sqlInstances.cpu.utilization * 100).toFixed(1)}% of
							{utilization.sqlInstances.cpu.requested.toFixed(0)} core{utilization.sqlInstances.cpu
								.requested > 1
								? 's'
								: ''}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if utilization.sqlInstances !== PendingValue}
						<CircleProgressBar progress={utilization.sqlInstances.memory.utilization} />
					{:else}
						<Skeleton height="50px" width="50px" variant="circle" />
					{/if}
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization">
							Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{#if utilization.sqlInstances !== PendingValue}
							{(utilization.sqlInstances.memory.utilization * 100).toFixed(1)}% of
							{prettyBytes(utilization.sqlInstances.memory.requested)}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if utilization.sqlInstances !== PendingValue}
						<CircleProgressBar progress={utilization.sqlInstances.disk.utilization} />
					{:else}
						<Skeleton height="50px" width="50px" variant="circle" />
					{/if}
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current disk utilization">
							Disk utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{#if utilization.sqlInstances !== PendingValue}
							{(utilization.sqlInstances.disk.utilization * 100).toFixed(1)}% of
							{prettyBytes(utilization.sqlInstances.disk.requested)}
						{:else}
							<Skeleton variant="text" />
						{/if}
					</p>
				</div>
			</div>
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
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th style="width: 2rem"></Th>
				<Th sortable={true} sortKey={SqlInstanceOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={SqlInstanceOrderField.VERSION}>Version</Th>
				<Th sortable={true} sortKey={SqlInstanceOrderField.ENVIRONMENT}>Env</Th>
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
								<a href="/team/{teamName}/{i.environment.name}/postgres/{i.name}">{i.name}</a>
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
				<div class="pagination">
					<span>
						{#if instances.pageInfo.pageStart !== instances.pageInfo.pageEnd}
							{instances.pageInfo.pageStart} - {instances.pageInfo.pageEnd}
						{:else}
							{instances.pageInfo.pageStart}
						{/if}

						of {instances.pageInfo.totalCount}
					</span>

					<span style="padding-left: 1rem;">
						<Button
							size="small"
							variant="secondary"
							disabled={!instances.pageInfo.hasPreviousPage}
							on:click={async () => {
								return await SqlInstances.loadPreviousPage();
							}}><ChevronLeftIcon /></Button
						>
						<Button
							size="small"
							variant="secondary"
							disabled={!instances.pageInfo.hasNextPage}
							on:click={async () => {
								return await SqlInstances.loadNextPage();
							}}
						>
							<ChevronRightIcon /></Button
						>
					</span>
				</div>
			{/if}
		{/if}
	</Card>
{/if}

<style>
	.summary-grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
		margin-bottom: 1rem;
	}

	.summaryIcon {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 1px solid var(--bg-color);
		border-radius: 5px;
	}

	.summary {
		width: 100%;
	}

	.summary > h4 {
		display: flex;
		justify-content: space-between;
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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
