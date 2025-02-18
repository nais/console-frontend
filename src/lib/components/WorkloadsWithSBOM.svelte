<script lang="ts">
	import { page } from '$app/state';
	import {
		graphql,
		PendingValue,
		WorkloadOrderField,
		type OrderDirection$options,
		type WorkloadOrderField$options
	} from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import { severityToColor } from '$lib/utils/vulnerabilities';
	import {
		BodyShort,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import { CheckmarkIcon } from '@nais/ds-svelte-community/icons';
	import type { WorkloadsWithSbomVariables } from './$houdini';
	import WorkloadLink from './WorkloadLink.svelte';

	interface Props {
		team: string;
		environment: string;
		[key: string]: unknown;
	}

	let { team, environment }: Props = $props();

	export const _WorkloadsWithSbomVariables: WorkloadsWithSbomVariables = () => {
		const env = environment;
		const field = tableSort.orderBy
			? tableSort.orderBy
			: WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL;
		const direction = tableSort.direction ? tableSort.direction : 'DESC';
		if (env) {
			return {
				team: team,
				orderBy: {
					field,
					direction
				},
				filter: { environments: [env] },

				after: null,
				before: null
			};
		}
		return {
			team: team,
			orderBy: {
				field,
				direction
			},
			filter: { environments: [] }
		};
	};

	const query = graphql(`
		query WorkloadsWithSbom(
			$team: Slug!
			$orderBy: WorkloadOrder
			$filter: TeamWorkloadsFilter
			$after: Cursor
			$before: Cursor
		) @load {
			team(slug: $team) @loading {
				workloads(first: 10, orderBy: $orderBy, filter: $filter, after: $after, before: $before)
					@paginate(mode: SinglePage)
					@loading(count: 10) {
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
				<Th sortable={true} sortKey={WorkloadOrderField.ENVIRONMENT} style="width: 142px;"
					>Environment</Th
				>
				<Th
					sortable={true}
					sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_CRITICAL}
					style="width: 102px;">Critical</Th
				>
				<Th
					sortable={true}
					sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_HIGH}
					style="width: 86px;">High</Th
				>
				<Th
					sortable={true}
					sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_MEDIUM}
					style="width: 108px;">Medium</Th
				>
				<Th
					sortable={true}
					sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_LOW}
					style="width: 82px;">Low</Th
				>
				<Th
					sortable={true}
					sortKey={WorkloadOrderField.VULNERABILITY_SEVERITY_UNASSIGNED}
					style="width: 134px;">Unassigned</Th
				>
				<Th
					sortable={true}
					sortKey={WorkloadOrderField.VULNERABILITY_RISK_SCORE}
					style="width: 124px;">Risk Score</Th
				>
			</Tr>
		</Thead>
		<Tbody>
			{#if team.workloads === PendingValue}
				{#each new Array(10).fill('text') as type, i (i)}
					<Tr>
						<Td colspan={999}><Skeleton variant={type} style="min-height: 44px;" /></Td>
					</Tr>
				{/each}
			{:else if team.workloads.nodes.length > 0}
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
								<div class="vulnerability-summary">
									<Tooltip content={'critical'}>
										{#if workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.critical > 0}
												<BodyShort
													class="vulnerability-count"
													style="background-color: {severityToColor('critical')}"
												>
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.critical
														: '-'}
												</BodyShort>
											{:else}
												<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.75rem;" />
											{/if}
										{:else}
											-
										{/if}
									</Tooltip>
								</div>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<div class="vulnerability-summary">
									<Tooltip content={'high'}>
										{#if workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.high > 0}
												<BodyShort
													class="vulnerability-count"
													style="background-color: {severityToColor('high')}"
												>
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.high
														: '-'}
												</BodyShort>
											{:else}
												<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.75rem;" />
											{/if}
										{:else}
											-
										{/if}
									</Tooltip>
								</div>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<div class="vulnerability-summary">
									<Tooltip content={'medium'}>
										{#if workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.medium > 0}
												<BodyShort
													class="vulnerability-count"
													style="background-color: {severityToColor('medium')}"
												>
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.medium
														: '-'}
												</BodyShort>
											{:else}
												<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.75rem;" />
											{/if}
										{:else}
											-
										{/if}
									</Tooltip>
								</div>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<div class="vulnerability-summary">
									<Tooltip content={'low'}>
										{#if workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.low > 0}
												<BodyShort
													class="vulnerability-count"
													style="background-color: {severityToColor('low')}"
												>
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.low
														: '-'}
												</BodyShort>
											{:else}
												<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.75rem;" />
											{/if}
										{:else}
											-
										{/if}
									</Tooltip>
								</div>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<div class="vulnerability-summary">
									<Tooltip content={'unassigned'}>
										{#if workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.unassigned > 0}
												<BodyShort
													class="vulnerability-count"
													style="background-color: {severityToColor('unassigned')}"
												>
													{workload.image.vulnerabilitySummary.unassigned}
												</BodyShort>
											{:else}
												<CheckmarkIcon style="color: var(--a-icon-success); font-size: 1.75rem;" />
											{/if}
										{:else}
											-
										{/if}
									</Tooltip>
								</div>
							</div>
						</Td>
						<Td>
							<div class="vulnerability">
								<div class="vulnerability-summary">
									<Tooltip content={'risk score'}>
										<BodyShort class="vulnerability-count">
											{workload.image.vulnerabilitySummary
												? workload.image.vulnerabilitySummary.riskScore
												: '-'}
										</BodyShort>
									</Tooltip>
								</div>
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
	{#if $query.data?.team.workloads !== PendingValue}
		<div>
			<Pagination
				page={$query.data?.team.workloads.pageInfo}
				loaders={{
					loadNextPage: () => {
						query.loadNextPage();
					},
					loadPreviousPage: () => {
						query.loadPreviousPage();
					}
				}}
			/>
		</div>
	{/if}
{/if}

<style>
	.vulnerability-summary {
		display: flex;
		gap: 1px;

		:global(.vulnerability-count) {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;

			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;
		}

		:global(.vulnerability-count) {
			padding: 4px 10px;
		}

		:global(.vulnerability-count) {
			padding: 4px 10px;
		}
	}
	.vulnerability {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
