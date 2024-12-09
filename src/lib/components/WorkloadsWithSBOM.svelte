<script lang="ts">
	import { graphql, PendingValue, WorkloadOrderField } from '$houdini';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Button,
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
		ArrowCirclepathIcon,
		ChevronLeftIcon,
		ChevronRightIcon,
		SandboxIcon
	} from '@nais/ds-svelte-community/icons';
	import { untrack } from 'svelte';
	import type { WorkloadsWithSbomVariables } from './$houdini';
	import Vulnerability from './Vulnerability.svelte';
	import WorkloadLink from './WorkloadLink.svelte';

	export const _WorkloadsWithSbomVariables: WorkloadsWithSbomVariables = () => {
		return untrack(() => {
			if (environment !== '') {
				return {
					team: team,
					orderBy: {
						field: tableSort.orderBy
							? tableSort.orderBy
							: WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL,
						direction: tableSort.direction ? tableSort.direction : 'DESC'
					},
					filter: { environments: [environment] }
				};
			}
			return {
				team: team,
				orderBy: {
					field: tableSort.orderBy
						? tableSort.orderBy
						: WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL,
					direction: tableSort.direction ? tableSort.direction : 'DESC'
				}
			};
		});
	};

	const query = graphql(`
		query WorkloadsWithSbom($team: Slug!, $orderBy: WorkloadOrder, $filter: TeamWorkloadsFilter)
		@load {
			team(slug: $team) @loading {
				workloads(first: 10, orderBy: $orderBy, filter: $filter)
					@paginate(mode: SinglePage)
					@loading {
					pageInfo @loading {
						totalCount @loading
						pageStart
						pageEnd
						hasNextPage
						hasPreviousPage
					}
					nodes @loading {
						__typename @loading
						name
						environment {
							name
						}
						team {
							slug
						}
						image @loading {
							name
							tag
							hasSBOM
							vulnerabilitySummary @loading {
								critical @loading
								high @loading
								medium @loading
								low @loading
								unassigned @loading
								riskScore @loading
							}
						}
					}
				}
			}
		}
	`);

	interface Props {
		team: string;
		environment: string;
		[key: string]: unknown;
	}

	let { team, environment, ...rest }: Props = $props();

	let tableSort = $derived({
		orderBy: $query.variables?.orderBy?.field,
		direction: $query.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = WorkloadOrderField[key as keyof typeof WorkloadOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL
		});
	};
</script>

{#if $query.data?.team}
	{@const team = $query.data.team}

	<Table
		zebraStripes
		size="small"
		sort={{
			orderBy: tableSort.orderBy || WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL,
			direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
		}}
		onsortchange={tableSortChange}
	>
		<Thead>
			<Tr>
				<Th></Th>
				<Th sortable={true} sortKey={WorkloadOrderField.NAME}>Workload</Th>
				<Th sortable={true} sortKey={WorkloadOrderField.ENVIRONMENT}>Environment</Th>
				<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL}
					>Critical</Th
				>
				<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_HIGH}>High</Th>
				<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_MEDIUM}>Medium</Th>
				<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_LOW}>Low</Th>
				<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_UNASSIGNED}
					>Unassigned</Th
				>
				<Th sortable={true} sortKey={WorkloadOrderField.VULNERABILITY_RISK_SCORE}>Risk Score</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#if team.workloads.nodes.length > 0}
				{@const workloads = team.workloads.nodes}
				{#each workloads as workload}
					<Tr>
						<Td>
							{#if workload.__typename !== PendingValue}
								{#if workload.__typename === 'Application'}
									<Tooltip placement="right" content="Application">
										<span style="color:var(--a-gray-600)"><SandboxIcon {...rest} /> </span>
									</Tooltip>
								{:else if workload.__typename === 'Job'}
									<Tooltip placement="right" content="Job">
										<span style="color:var(--a-gray-600)"><ArrowCirclepathIcon {...rest} /> </span>
									</Tooltip>
								{/if}
							{:else}
								<Skeleton variant="circle" width="16px" height="16px" />
							{/if}
						</Td>
						<Td>
							{#if workload.__typename !== PendingValue}
								<WorkloadLink {workload} />
							{:else}
								<Skeleton variant="text" />
							{/if}
						</Td>
						<Td>
							{#if workload.__typename !== PendingValue}
								{workload.environment.name}
							{:else}
								<Skeleton variant="text" />
							{/if}
						</Td>
						<Td>
							<div class="vulnerability">
								<Vulnerability
									severity="critical"
									count={workload.image.vulnerabilitySummary
										? workload.image.vulnerabilitySummary.critical
										: undefined}
									size="32px"
								/>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<Vulnerability
									severity="high"
									count={workload.image.vulnerabilitySummary
										? workload.image.vulnerabilitySummary.high
										: undefined}
									size="32px"
								/>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<Vulnerability
									severity="medium"
									count={workload.image.vulnerabilitySummary
										? workload.image.vulnerabilitySummary.medium
										: undefined}
									size="32px"
								/>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<Vulnerability
									severity="low"
									count={workload.image.vulnerabilitySummary
										? workload.image.vulnerabilitySummary.low
										: undefined}
									size="32px"
								/>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<Vulnerability
									severity="unassigned"
									count={workload.image.vulnerabilitySummary
										? workload.image.vulnerabilitySummary.unassigned
										: undefined}
									size="32px"
								/>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								{#if workload.image.vulnerabilitySummary?.riskScore !== PendingValue}
									<span class="align-center"
										>{workload.image.vulnerabilitySummary
											? workload.image.vulnerabilitySummary.riskScore
											: '-'}</span
									>
								{:else}
									<Skeleton variant="text" width="32px" />
								{/if}
							</div>
						</Td>
					</Tr>
				{/each}
			{:else}
				<Tr>
					<Td colspan={9}>No workloads with vulnerability data found</Td>
				</Tr>
			{/if}
		</Tbody>
	</Table>
	{#if $query.data?.team.workloads.pageInfo.totalCount !== PendingValue && ($query.data?.team.workloads.pageInfo.hasPreviousPage || $query.data?.team.workloads.pageInfo.hasNextPage)}
		<div class="pagination">
			<span>
				{#if $query.data?.team.workloads.pageInfo.pageStart !== $query.data?.team.workloads.pageInfo.pageEnd}
					{$query.data?.team.workloads.pageInfo.pageStart} - {$query.data?.team.workloads.pageInfo
						.pageEnd}
				{:else}
					{$query.data?.team.workloads.pageInfo.pageStart}
				{/if}

				of {$query.data?.team.workloads.pageInfo.totalCount}
			</span>

			<span style="padding-left: 1rem;">
				<Button
					size="small"
					variant="secondary"
					disabled={!$query.data?.team.workloads.pageInfo.hasPreviousPage}
					onclick={async () => {
						return await query.loadPreviousPage();
					}}><ChevronLeftIcon /></Button
				>
				<Button
					size="small"
					variant="secondary"
					disabled={!$query.data?.team.workloads.pageInfo.hasNextPage}
					onclick={async () => {
						return await query.loadNextPage();
					}}
				>
					<ChevronRightIcon /></Button
				>
			</span>
		</div>
	{/if}
{/if}

<style>
	.vulnerability {
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.align-center {
		text-align: center;
	}

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
