<script lang="ts">
	import { page } from '$app/stores';
	import { SqlInstanceOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';

	import { goto } from '$app/navigation';
	import {
		Alert,
		Button,
		HelpText,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		ExclamationmarkTriangleFillIcon
	} from '@nais/ds-svelte-community/icons';

	import { get } from 'svelte/store';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ SqlInstances } = data);

	$: tableSort = {
		orderBy: $SqlInstances.variables?.orderBy?.field,
		direction: $SqlInstances.variables?.orderBy?.direction
	};

	const changeParams = (params: Record<string, string>) => {
		const query = new URLSearchParams(get(page).url.searchParams);
		for (const [key, value] of Object.entries(params)) {
			query.set(key, value);
		}
		goto(`?${query.toString()}`);
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
			field: tableSort.orderBy || 'NAME'
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
	{@const instances = $SqlInstances.data.team.sqlInstances}
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
						<!--{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							€{Math.round(metrics.cost)}
						{/if}-->
						TODO: Implement cost
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<!--{#if metrics.cost === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={metrics.cpu.utilization / 100} />
					{/if}-->
					TODO: Implement CPU
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						<!--{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{metrics.cpu.utilization.toFixed(1)}% of {metrics.cpu.cores.toLocaleString()} core(s)
						{/if}-->
						TODO: Implement CPU
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<!--{#if metrics.cost === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={metrics.memory.utilization / 100} />
					{/if}-->
					TODO: Implement memory
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization">
							Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						<!--{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{metrics.memory.utilization.toFixed(1)}% of {prettyBytes(metrics.memory.quotaBytes)}
						{/if}-->
						TODO: Implement memory
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<!--{#if metrics.cost === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={metrics.disk.utilization / 100} />
					{/if}-->
					TODO: Implement disk
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current memory utilization">
							Disk utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						<!--{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{metrics.disk.utilization.toFixed(1)}% of {prettyBytes(metrics.disk.quotaBytes)}
						{/if}-->
						TODO: Implement disk
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
				orderBy: tableSort.orderBy || 'NAME',
				direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
			}}
			on:sortChange={tableSortChange}
		>
			<Thead>
				<Th style="width: 2rem"></Th>
				<Th sortable={true} sortKey={SqlInstanceOrderField.NAME}>Name</Th>
				<Th sortable={true} sortKey={SqlInstanceOrderField.VERSION}>Version</Th>
				<Th sortable={true} sortKey={SqlInstanceOrderField.ENVIRONMENT}>Env</Th>
				<Th>Status</Th>
				<Th>Cost</Th>
				<Th><Tooltip content="CPU utilization for the last elapsed hour">CPU</Tooltip></Th>
				<Th><Tooltip content="Memory utilization for the last elapsed hour">Memory</Tooltip></Th>
				<Th><Tooltip content="Disk utilization for the last elapsed hour">Disk</Tooltip></Th>
			</Thead>
			<Tbody>
				{#each instances.edges as edge}
					<Tr>
						<Td>
							{#if !edge.node.workload?.name}
								<Tooltip content="The SQL instance does not belong to any workload">
									<ExclamationmarkTriangleFillIcon
										style="color: var(--a-icon-warning)"
										title="The SQL instance does not belong to any workload"
									/>
								</Tooltip>
							{/if}
						</Td>
						<Td>
							<a href="/team/{teamName}/{edge.node.environment.name}/postgres/{edge.node.name}"
								>{edge.node.name}</a
							>
						</Td>
						<Td>
							{edge.node.version}
						</Td>
						<Td>
							{edge.node.environment.name}
						</Td>

						<Td
							><!--
								{#if edge.node.healthy && edge.node.state === 'RUNNABLE'}
									<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
								{:else if node.state !== 'RUNNABLE'}
									<Tooltip content="Unhealthy state: {node.state}" placement="right">
										<XMarkIcon style="color: var(--a-icon-danger); font-size: 1.2rem" />
									</Tooltip>
								{:else}
									<Tooltip
										content="The SQL instance has config errors. Check conditions on instance page."
										placement="right"
									>
										<ExclamationmarkTriangleFillIcon style="color: var(--a-icon-warning)" />
									</Tooltip>
								{/if}-->
						</Td>
						<Td>
							<!--{#if node.metrics.cost > 0}
									€{Math.round(node.metrics.cost)}
								{:else}
									-
								{/if}-->
							TODO: Implement cost
						</Td>
						<Td>
							<!--{#if node.metrics.cpu.utilization}
									<span
										title="{node.metrics.cpu.utilization.toFixed(1)}% of {node.metrics.cpu
											.cores} core(s)">{node.metrics.cpu.utilization.toFixed(1)}%</span
									>
								{/if}-->
							TODO: Implement CPU
						</Td>
						<Td>
							<!--{#if node.metrics.memory.utilization}
									<span
										title="{node.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
											node.metrics.memory.quotaBytes
										)}">{node.metrics.memory.utilization.toFixed(1)}%</span
									>
								{/if}-->
							TODO: Implement memory
						</Td>
						<Td>
							<!--
								{#if node.metrics.disk.utilization}
									<span
										title="{node.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
											node.metrics.disk.quotaBytes
										)}">{node.metrics.disk.utilization.toFixed(1)}%</span
									>
								{/if}-->
							TODO: Implement disk
						</Td>
					</Tr>
				{:else}
					<Tr>
						<Td colspan={999}>No SQL instances found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
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
</style>
