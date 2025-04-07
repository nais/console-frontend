<script lang="ts">
	import { page } from '$app/state';
	import {
		graphql,
		OrderDirection,
		PendingValue,
		WorkloadOrderField,
		type OrderDirection$options,
		type WorkloadOrderField$options
	} from '$houdini';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
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
			: WorkloadOrderField.VULNERABILITY_RISK_SCORE;
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
				slug
				workloads(first: 25, orderBy: $orderBy, filter: $filter, after: $after, before: $before)
					@paginate(mode: SinglePage)
					@loading(count: 25) {
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
						teamEnvironment {
							environment {
								name
							}
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
		orderBy:
			(page.url.searchParams.get('field') as WorkloadOrderField$options) ||
			WorkloadOrderField.VULNERABILITY_RISK_SCORE,
		direction:
			(page.url.searchParams.get('direction') as OrderDirection$options) || OrderDirection.DESC
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
			field: tableSort.orderBy || WorkloadOrderField.VULNERABILITY_RISK_SCORE
		});
	};

	const vulnerabilityReportUrl = (workload: {
		readonly __typename: string | null;
		readonly id: string;
		readonly name: string;
		readonly teamEnvironment: {
			readonly environment: {
				readonly name: string;
			};
		};
		readonly team: {
			readonly slug: string;
		};
	}) => {
		return `/team/${workload.team.slug}/${workload.teamEnvironment.environment.name}/${workload.__typename === 'Application' ? 'app' : 'job'}/${workload.name}/vulnerability-report`;
	};

	export function severityToColorWithHover(severity: string): string {
		switch (severity) {
			case 'critical':
				return 'var(--ax-danger-200, --a-red-200)';
			case 'high':
				return 'var(--ax-warning-200, --a-orange-200)';
			case 'medium':
				return 'var(--ax-warning-200, --a-orange-200)';
			case 'low':
				return 'var(--ax-success-200, --a-green-200)';
			case 'unassigned':
				return 'var(--ax-neutral-200, --a-gray-200)';
			default:
				return 'var(--ax-neutral-200, --a-gray-200)';
		}
	}
</script>

{#if $query.data?.team}
	{@const team = $query.data.team}
	<Table
		size="small"
		sort={{
			orderBy: tableSort.orderBy || WorkloadOrderField.VULNERABILITY_RISK_SCORE,
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
							<WorkloadLink {workload} />
						</Td>
						<Td>
							{workload.teamEnvironment.environment.name}
						</Td>
						<Td>
							<div class="vulnerability">
								<div class="vulnerability-summary">
									<Tooltip content="critical">
										{#if workload.image.hasSBOM && workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.critical > 0}
												<a
													href={vulnerabilityReportUrl(workload)}
													class="vulnerability-count CRITICAL"
												>
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.critical
														: '-'}
												</a>
											{:else}
												<CheckmarkIcon
													style="color: var(--ax-text-success-icon, --a-icon-success); font-size: 1.75rem;"
												/>
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
									<Tooltip content="high">
										{#if workload.image.hasSBOM && workload.image.vulnerabilitySummary}
											{#if workload.image.hasSBOM && workload.image.vulnerabilitySummary.high > 0}
												<a href={vulnerabilityReportUrl(workload)} class="vulnerability-count HIGH">
													{workload.image.vulnerabilitySummary.high}
												</a>
											{:else}
												<CheckmarkIcon
													style="color: var(--ax-text-success-icon, --a-icon-success); font-size: 1.75rem;"
												/>
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
									<Tooltip content="medium">
										{#if workload.image.hasSBOM && workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.medium > 0}
												<a
													href={vulnerabilityReportUrl(workload)}
													class="vulnerability-count MEDIUM"
												>
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.medium
														: '-'}
												</a>
											{:else}
												<CheckmarkIcon
													style="color: var(--ax-text-success-icon, --a-icon-success); font-size: 1.75rem;"
												/>
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
									<Tooltip content="low">
										{#if workload.image.hasSBOM && workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.low > 0}
												<a href={vulnerabilityReportUrl(workload)} class="vulnerability-count LOW">
													{workload.image.vulnerabilitySummary
														? workload.image.vulnerabilitySummary.low
														: '-'}
												</a>
											{:else}
												<CheckmarkIcon
													style="color: var(--ax-text-success-icon, --a-icon-success); font-size: 1.75rem;"
												/>
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
									<Tooltip content="unassigned">
										{#if workload.image.hasSBOM && workload.image.vulnerabilitySummary}
											{#if workload.image.vulnerabilitySummary.unassigned > 0}
												<a
													href={vulnerabilityReportUrl(workload)}
													class="vulnerability-count UNASSIGNED"
												>
													{workload.image.vulnerabilitySummary.unassigned}
												</a>
											{:else}
												<CheckmarkIcon
													style="color: var(--ax-text-success-icon, --a-icon-success); font-size: 1.75rem;"
												/>
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
									<Tooltip content="risk score">
										<BodyShort class="vulnerability-count">
											<a
												href={vulnerabilityReportUrl(workload)}
												class="vulnerability-count RISK_SCORE"
											>
												{workload.image.vulnerabilitySummary && workload.image.hasSBOM
													? workload.image.vulnerabilitySummary.riskScore
													: '-'}
											</a>
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

		.vulnerability-count {
			border-top-left-radius: 4px;
			border-bottom-left-radius: 4px;

			border-top-right-radius: 4px;
			border-bottom-right-radius: 4px;

			padding: 4px 10px;

			color: inherit;
			text-decoration: none;

			&.CRITICAL {
				background-color: var(--ax-danger-200, --a-red-200);
				&:hover {
					background-color: var(--ax-danger-300, --a-red-300);
				}
			}
			&.HIGH {
				background-color: color-mix(
					in oklab,
					var(--ax-danger-200, --a-red-200),
					var(--ax-warning-200, --a-orange-200)
				);
				&:hover {
					background-color: color-mix(
						in oklab,
						var(--ax-danger-300, --a-red-300),
						var(--ax-warning-300, --a-orange-300)
					);
				}
			}
			&.MEDIUM {
				background-color: var(--ax-warning-200, --a-orange-200);
				&:hover {
					background-color: var(--ax-warning-300, --a-orange-300);
				}
			}
			&.LOW {
				background-color: var(--ax-success-200, --a-green-200);
				&:hover {
					background-color: var(--ax-success-300, --a-green-300);
				}
			}
			&.UNASSIGNED {
				background-color: var(--ax-neutral-200, --a-gray-200);
				&:hover {
					background-color: var(--ax-neutral-300, --a-gray-300);
				}
			}

			&.RISK_SCORE {
				&:hover {
					background-color: var(--ax-neutral-300, --a-gray-300);
				}
			}
		}
	}
	.vulnerability {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
