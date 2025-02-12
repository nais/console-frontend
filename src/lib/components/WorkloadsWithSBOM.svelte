<script lang="ts">
	import { page } from '$app/state';
	import {
		graphql,
		WorkloadOrderField,
		type OrderDirection$options,
		type WorkloadOrderField$options
	} from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { untrack } from 'svelte';
	import type { WorkloadsWithSbomVariables } from './$houdini';
	import Vulnerability from './Vulnerability.svelte';
	import WorkloadLink from './WorkloadLink.svelte';

	interface Props {
		team: string;
		environment: string;
		[key: string]: unknown;
	}

	let { team, environment = $bindable() }: Props = $props();

	export const _WorkloadsWithSbomVariables: WorkloadsWithSbomVariables = () => {
		return untrack(() => {
			const env = environment;
			const field = tableSort.orderBy
				? tableSort.orderBy
				: WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL;
			const direction = tableSort.direction ? tableSort.direction : 'DESC';

			if (env !== '') {
				return {
					team: team,
					orderBy: {
						field,
						direction
					},
					filter: { environments: [env] }
				};
			}
			return {
				team: team,
				orderBy: {
					field,
					direction
				}
			};
		});
	};

	const query = graphql(`
		query WorkloadsWithSbom($team: Slug!, $orderBy: WorkloadOrder, $filter: TeamWorkloadsFilter)
		@load {
			team(slug: $team) {
				workloads(first: 10, orderBy: $orderBy, filter: $filter) @paginate(mode: SinglePage) {
					pageInfo {
						totalCount
						pageStart
						pageEnd
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
					}
					nodes {
						__typename
						id
						name
						environment {
							id
							name
						}
						team {
							slug
						}
						image {
							name
							tag
							hasSBOM
							vulnerabilitySummary {
								critical
								high
								medium
								low
								unassigned
								riskScore
							}
						}
					}
				}
			}
		}
	`);

	let tableSort = $derived({
		orderBy: page.url.searchParams.get('field') as WorkloadOrderField$options | null,
		direction: page.url.searchParams.get('direction') as OrderDirection$options | null
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = WorkloadOrderField[key as WorkloadOrderField$options];
			switch (tableSort.orderBy) {
				case WorkloadOrderField.ENVIRONMENT:
				case WorkloadOrderField.NAME:
					tableSort.direction = 'ASC';
					break;
				default:
					tableSort.direction = 'DESC';
			}
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
				{#each workloads as workload (workload.id)}
					<Tr>
						<Td>
							<WorkloadLink {workload} showIcon={true} />
						</Td>
						<Td>
							{workload.environment.name}
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
								<span class="align-center"
									>{workload.image.vulnerabilitySummary
										? workload.image.vulnerabilitySummary.riskScore
										: '-'}</span
								>
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

	<Pagination
		page={$query.data?.team.workloads.pageInfo}
		loaders={{
			loadNextPage: async () => {
				await query.loadNextPage();
			},
			loadPreviousPage: async () => {
				await query.loadPreviousPage();
			}
		}}
	/>
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
</style>
