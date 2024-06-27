<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import CircleProgressBar from '$lib/components/CircleProgressBar.svelte';
	import CostIcon from '$lib/icons/CostIcon.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import {
		Alert,
		CopyButton,
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
		ExclamationmarkTriangleFillIcon,
		XMarkIcon
	} from '@nais/ds-svelte-community/icons';
	import prettyBytes from 'pretty-bytes';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ SqlInstances } = data);
	$: team = $SqlInstances.data?.team;
	$: metrics = $SqlInstances.data?.team.sqlInstances.metrics;

	$: ({ sortState, limit, offset } = tableStateFromVariables($SqlInstances.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstances.errors}
	{#each distinctErrors($SqlInstances.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{:else if team && metrics}
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
						{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							€{Math.round(metrics.cost)}
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if metrics.cost === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={metrics.cpu.utilization / 100} />
					{/if}
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{metrics.cpu.utilization.toFixed(1)}% of {metrics.cpu.cores.toLocaleString()} core(s)
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if metrics.cost === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={metrics.memory.utilization / 100} />
					{/if}
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{metrics.memory.utilization.toFixed(1)}% of {prettyBytes(metrics.memory.quotaBytes)}
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if metrics.cost === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={metrics.disk.utilization / 100} />
					{/if}
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current memory utilization"
							>Disk utilization for the last elapsed hour.
						</HelpText>
					</h4>
					<p class="metric">
						{#if metrics.cost === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{metrics.disk.utilization.toFixed(1)}% of {prettyBytes(metrics.disk.quotaBytes)}
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
			sort={sortState}
			on:sortChange={(e) => {
				const { key } = e.detail;
				const ss = sortTable(key, sortState);
				changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
			}}
		>
			<Thead>
				<Th style="width: 2rem"></Th>
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="VERSION">Version</Th>
				<Th sortable={true} sortKey="ENV">Env</Th>
				<Th>Connection Name</Th>
				<Th sortable={true} sortKey="STATUS">Status</Th>
				<Th sortable={true} sortKey="COST">Cost</Th>
				<Th sortable={true} sortKey="CPU"
					><Tooltip content="CPU utilization for the last elapsed hour">CPU</Tooltip></Th
				>
				<Th sortable={true} sortKey="MEMORY"
					><Tooltip content="Memory utilization for the last elapsed hour">Memory</Tooltip></Th
				>
				<Th sortable={true} sortKey="DISK"
					><Tooltip content="Disk utilization for the last elapsed hour">Disk</Tooltip></Th
				>
			</Thead>
			<Tbody>
				{#if team !== undefined}
					{#if team.id === PendingValue}
						<Tr>
							{#each new Array(11).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						</Tr>
					{:else}
						{#each team.sqlInstances.nodes as node}
							<Tr>
								<Td>
									{#if !node.workload?.name}
										<Tooltip content="The SQL instance does not belong to any workload">
											<ExclamationmarkTriangleFillIcon
												style="color: var(--a-icon-warning)"
												title="The SQL instance does not belong to any workload"
											/>
										</Tooltip>
									{/if}
								</Td>
								<Td>
									<a href="/team/{teamName}/{node.env.name}/postgres/{node.name}">{node.name}</a>
								</Td>
								<Td>
									{node.type}
								</Td>
								<Td>
									{node.env.name}
								</Td>
								<Td>
									<div style="display: flex; column-gap: .5em; align-items: center; width: 15rem">
										{#if node.connectionName}
											<span
												style="width: 100%; direction: rtl; text-overflow: ellipsis; white-space: nowrap; overflow: hidden"
												title={node.connectionName}>{node.connectionName}</span
											>
											<CopyButton size="xsmall" variant="action" copyText={node.connectionName} />
										{/if}
									</div>
								</Td>
								<Td>
									{#if node.isHealthy && node.state === 'RUNNABLE'}
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
									{/if}
								</Td>
								<Td>
									{#if node.metrics.cost > 0}
										€{Math.round(node.metrics.cost)}
									{:else}
										-
									{/if}
								</Td>
								<Td>
									{#if node.metrics.cpu.utilization}
										<span
											title="{node.metrics.cpu.utilization.toFixed(1)}% of {node.metrics.cpu
												.cores} core(s)">{node.metrics.cpu.utilization.toFixed(1)}%</span
										>
									{/if}
								</Td>
								<Td>
									{#if node.metrics.memory.utilization}
										<span
											title="{node.metrics.memory.utilization.toFixed(1)}% of {prettyBytes(
												node.metrics.memory.quotaBytes
											)}">{node.metrics.memory.utilization.toFixed(1)}%</span
										>
									{/if}
								</Td>
								<Td>
									{#if node.metrics.disk.utilization}
										<span
											title="{node.metrics.disk.utilization.toFixed(1)}% of {prettyBytes(
												node.metrics.disk.quotaBytes
											)}">{node.metrics.disk.utilization.toFixed(1)}%</span
										>
									{/if}
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}>No SQL instances found</Td>
							</Tr>
						{/each}
					{/if}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.sqlInstances.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
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
