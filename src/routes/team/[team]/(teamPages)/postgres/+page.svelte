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
	<div class="grid">
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
						€{teamCost(team.sqlInstances.nodes).toFixed(0)}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={teamCpuUtilization(team.sqlInstances.nodes) / 100} />
				</div>
				<div class="summary">
					<h4>
						CPU utilization
						<HelpText title="Current CPU utilization"
							>CPU utilization for the last elapsed hour for team {teamName}.
						</HelpText>
					</h4>
					<p class="metric">
						{teamCpuUtilization(team.sqlInstances.nodes).toFixed(1)}% of {team.sqlInstances.nodes.reduce(
							(acc, r) => {
								if (r.metrics.cpu.cores !== PendingValue) {
									return acc + r.metrics.cpu.cores;
								}
								return acc;
							},
							0
						)} core(s)
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={teamMemoryUtilization(team.sqlInstances.nodes) / 100} />
				</div>
				<div class="summary">
					<h4>
						Memory utilization
						<HelpText title="Current memory utilization"
							>Memory utilization for the last elapsed hour for team {teamName}.
						</HelpText>
					</h4>
					<p class="metric">
						{teamMemoryUtilization(team.sqlInstances.nodes).toFixed(1)}% of {prettyBytes(
							team.sqlInstances.nodes.reduce((acc, r) => {
								if (r.metrics.memory.quotaBytes !== PendingValue) {
									return acc + r.metrics.memory.quotaBytes;
								}
								return acc;
							}, 0)
						)}
					</p>
				</div>
			</div>
		</Card>
		<Card columns={3}>
			<div class="summaryCard">
				<div>
					<CircleProgressBar progress={teamDiskUtilization(team.sqlInstances.nodes) / 100} />
				</div>
				<div class="summary">
					<h4>
						Disk utilization
						<HelpText title="Current disk utilization"
							>Disk utilization for the last elapsed hour for team {teamName}.
						</HelpText>
					</h4>
					<p class="metric">
						{teamDiskUtilization(team.sqlInstances.nodes).toFixed(1)}% of {prettyBytes(
							team.sqlInstances.nodes.reduce((acc, r) => {
								if (r.metrics.disk.quotaBytes !== PendingValue) {
									return acc + r.metrics.disk.quotaBytes;
								}
								return acc;
							}, 0)
						)}
					</p>
				</div>
			</div>
		</Card>
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
					<Th><Tooltip content="High availability">HA</Tooltip></Th>
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
										{#if !node.app?.name}
											<Tooltip
												content="The SQL instance does not belong to any application resource"
											>
												<ExclamationmarkTriangleFillIcon
													style="color: var(--a-icon-warning)"
													title="The SQL instance does not belong to any application resource"
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
									<Td style="display: flex; align-items: center;">
										{#if node.connectionName}
											<Tooltip content={node.connectionName}
												>...{node.connectionName.split(':').pop()}</Tooltip
											>
											<CopyButton size="small" variant="action" copyText={node.connectionName} />
										{/if}
									</Td>
									<Td>
										{#if node.isHealthy}
											<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
										{:else}
											<XMarkIcon style="color: var(--a-icon-danger)" />
										{/if}
									</Td>
									<Td>
										{#if node.highAvailability}
											<CheckmarkIcon style="color: var(--a-surface-success); font-size: 1.2rem" />
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
	</div>
{/if}

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(12, 1fr);
		column-gap: 1rem;
		row-gap: 1rem;
	}

	.tableHeader {
		display: flex;
		gap: 0.5rem;
	}
	.summaryIcon {
		display: flex;
		background-color: color-mix(in srgb, var(--bg-color) 10%, white);
		justify-content: center;
		align-items: center;
		width: 50px;
		height: 50px;
		border: 2px solid var(--bg-color);
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
