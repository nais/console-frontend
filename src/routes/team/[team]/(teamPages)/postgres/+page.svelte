<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, type SqlInstances$result } from '$houdini';
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
	import { percentageFormatter } from '$lib/utils/formatters';
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

	$: ({ sortState, limit, offset } = tableStateFromVariables($SqlInstances.variables));
	const teamCost = (instances: SqlInstances$result['team']['sqlInstances']['nodes']) =>
		instances.reduce((acc, r) => {
			if (r.cost !== PendingValue) {
				return acc + r.cost;
			}
			return acc;
		}, 0);

	const teamCpuUtilization = (instances: SqlInstances$result['team']['sqlInstances']['nodes']) => {
		let numWithMetrics = 0;
		const sum = instances.reduce((acc, r) => {
			if (r.metrics.cpu.utilization !== PendingValue && r.metrics.cpu.utilization > 0) {
				numWithMetrics++;
				return acc + r.metrics.cpu.utilization;
			}
			return acc;
		}, 0);

		return sum / numWithMetrics;
	};

	const teamMemoryUtilization = (
		instances: SqlInstances$result['team']['sqlInstances']['nodes']
	) => {
		let numWithMetrics = 0;
		const sum = instances.reduce((acc, r) => {
			if (r.metrics.memory.utilization !== PendingValue && r.metrics.memory.utilization > 0) {
				numWithMetrics++;
				return acc + r.metrics.memory.utilization;
			}
			return acc;
		}, 0);

		return sum / numWithMetrics;
	};

	const teamDiskUtilization = (instances: SqlInstances$result['team']['sqlInstances']['nodes']) => {
		let numWithMetrics = 0;
		const sum = instances.reduce((acc, r) => {
			if (r.metrics.disk.utilization !== PendingValue && r.metrics.disk.utilization > 0) {
				numWithMetrics++;
				return acc + r.metrics.disk.utilization;
			}
			return acc;
		}, 0);

		return sum / numWithMetrics;
	};

	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $SqlInstances.errors}
	{#each distinctErrors($SqlInstances.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{:else if team}
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
						{#if team.id === PendingValue}
							<Skeleton variant="text" />
						{:else}
							€{Math.round(teamCost(team.sqlInstances.nodes))}
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if team.id === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={teamCpuUtilization(team.sqlInstances.nodes) / 100} />
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
						{#if team.id === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{team.sqlInstances.nodes.length === 0
								? '0' :
								teamCpuUtilization(team.sqlInstances.nodes).toFixed(1)}% of {team.sqlInstances.nodes
							.reduce((acc, r) => acc + r.metrics.cpu.cores, 0)
							.toLocaleString()}
							core(s)
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if team.id === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={teamMemoryUtilization(team.sqlInstances.nodes) / 100} />
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
						{#if team.id === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{team.sqlInstances.nodes.length === 0
								? '0' :
								teamMemoryUtilization(team.sqlInstances.nodes).toFixed(1)}% of {prettyBytes(
							team.sqlInstances.nodes.reduce((acc, r) => acc + r.metrics.memory.quotaBytes, 0)
						)}
						{/if}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					{#if team.id === PendingValue}
						<Skeleton height={'50px'} width={'50px'} variant="circle" />
					{:else}
						<CircleProgressBar progress={teamDiskUtilization(team.sqlInstances.nodes) / 100} />
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
						{#if team.id === PendingValue}
							<Skeleton variant="text" />
						{:else}
							{team.sqlInstances.nodes.length === 0
								? '0'
								: teamDiskUtilization(team.sqlInstances.nodes).toFixed(1)}% of {prettyBytes(
							team.sqlInstances.nodes.reduce((acc, r) => acc + r.metrics.disk.quotaBytes, 0)
						)}
						{/if}
					</p>
				</div>
			</div>
		</Card>
	</div>
	<Card columns={12}>
		<Table
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
				<Th>
					<div class="tableHeader">
						Cost<HelpText title="Cost per SQL Instance"
							>The cost of the SQL instance over the last 30 days</HelpText
						>
					</div>
				</Th>
				<Th><Tooltip content="CPU utilization for the last elapsed hour">CPU</Tooltip></Th>
				<Th><Tooltip content="Memory utilization for the last elapsed hour">Memory</Tooltip></Th>
				<Th><Tooltip content="Disk utilization for the last elapsed hour">Disk</Tooltip></Th>
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
									<div style="display: flex; align-items: center;">
										{#if node.connectionName}
											<Tooltip content={node.connectionName}
												>...{node.connectionName.split(':').pop()}</Tooltip
											>
											<CopyButton size="small" variant="action" copyText={node.connectionName} />
										{/if}
									</div>
								</Td>
								<Td>
									{#if node.isHealthy}
										<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
									{:else}
										<XMarkIcon style="color: var(--a-icon-danger)" />
									{/if}
								</Td>
								<Td>
									{#if node.cost > 0}
										€{Math.round(node.cost)}
									{:else}
										-
									{/if}
								</Td>
								<Td>
									{#if node.metrics.cpu.utilization}
										{percentageFormatter(node.metrics.cpu.utilization)}
									{/if}
								</Td>
								<Td>
									{#if node.metrics.memory.utilization}
										{percentageFormatter(node.metrics.memory.utilization)}
									{/if}
								</Td>
								<Td>
									{#if node.metrics.disk.utilization}
										{percentageFormatter(node.metrics.disk.utilization)}
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
	.tableHeader {
		display: flex;
		gap: 0.5rem;
	}

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
