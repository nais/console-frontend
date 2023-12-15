<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import { OrderByField } from '$houdini/graphql';
	import Card from '$lib/Card.svelte';
	import { logEvent } from '$lib/amplitude';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import type { TableSortState } from '@nais/ds-svelte-community';
	import {
		Alert,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tooltip,
		Tr
	} from '@nais/ds-svelte-community';
	import { ExclamationmarkTriangleFillIcon } from '@nais/ds-svelte-community/icons';
	import { sortTable } from '../../../../../helpers';
	import type { PageData } from './$houdini';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ TeamVulnerabilities } = data);
	$: team = $TeamVulnerabilities.data?.team;

	let sortState: TableSortState = {
		orderBy: 'SEVERITY_CRITICAL',
		direction: 'descending'
	};

	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/team/findings'
		};
		logEvent('pageview', props);
	};

	const refetch = (key: string) => {
		const field = Object.values(OrderByField).find((value) => value === key);
		TeamVulnerabilities.fetch({
			variables: {
				team: teamName,
				orderBy: {
					field: field !== undefined ? field : 'SEVERITY_CRITICAL',
					direction: sortState.direction === 'descending' ? 'DESC' : 'ASC'
				}
			}
		});
	};
</script>

{#if $TeamVulnerabilities.errors}
	<Alert variant="error">
		{#each $TeamVulnerabilities.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else}
	<div class="grid">
		<Card columns={12}>
			<Table
				size="small"
				sort={sortState}
				on:sortChange={(e) => {
					const { key } = e.detail;
					sortState = sortTable(key, sortState, refetch);
				}}
			>
				<Thead>
					<Th sortable={true} sortKey={OrderByField.NAME}>Name</Th>
					<Th sortable={true} sortKey={OrderByField.ENV}>Env</Th>
					<Th>Findings</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_CRITICAL}>Critical</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_HIGH}>High</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_MEDIUM}>Medium</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_LOW}>Low</Th>
					<Th sortable={true} sortKey={OrderByField.SEVERITY_UNASSIGNED}>Unassigned</Th>
					<Th sortable={true} sortKey={OrderByField.RISK_SCORE}>Risk Score</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(9).fill('text') as variant}
									<Td>
										<Skeleton {variant} />
									</Td>
								{/each}
							</Tr>
						{:else}
							{#each team.vulnerabilities.nodes as node}
								<Tr>
									<Td>
										<a href="/team/{teamName}/{node.env}/app/{node.appName}">{node.appName}</a>
									</Td>
									<Td>{node.env}</Td>
									{#if node.summary !== null}
										{#if !node.hasBom}
											<Td colspan={8}>
												<div style="display: flex; align-items: center">
													<span style="color:lightslategray; font-size:16px">
														<a href={node.findingsLink}>View</a>
													</span>
													<div class="sbom">
														<Tooltip
															placement="right"
															content="Data was discovered, but the SBOM was not rendered. Please refer to the NAIS documentation for further assistance"
														>
															<ExclamationmarkTriangleFillIcon
																style="color: var(--a-icon-warning)"
															/>
														</Tooltip>
													</div>
												</div>
											</Td>
										{:else}
											<Td>
												<span style="color:lightslategray; font-size:16px">
													<a href={node.findingsLink} on:click={onClick}>View</a>
												</span>
											</Td>
											<Td>
												<div class="vulnerability">
													<Vulnerability severity="critical" count={node.summary.critical} />
												</div>
											</Td>
											<Td>
												<div class="vulnerability">
													<Vulnerability severity="high" count={node.summary.high} />
												</div>
											</Td>
											<Td>
												<div class="vulnerability">
													<Vulnerability severity="medium" count={node.summary.medium} />
												</div>
											</Td>
											<Td>
												<div class="vulnerability">
													<Vulnerability severity="low" count={node.summary.low} />
												</div>
											</Td>
											<Td>
												<div class="vulnerability">
													<Vulnerability severity="unassigned" count={node.summary.unassigned} />
												</div>
											</Td>
											<Td>
												<div class="vulnerability">
													{#if node.summary.riskScore === -1}
														<Vulnerability severity="low" count={node.summary.riskScore} />
													{:else}
														<Tooltip
															placement="left"
															content="Calculated based on the number of vulnerabilities, includes unassigned"
														>
															<span class="na">{node.summary.riskScore}</span>
														</Tooltip>
													{/if}
												</div>
											</Td>
										{/if}
									{:else}
										<Td>
											No data found in dependencytrack.
											<a
												href="https://doc.nais.io/security/salsa/salsa/#slsa-in-nais"
												on:click={onClick}>How to fix</a
											>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
										<Td>
											<div class="na">-</div>
										</Td>
									{/if}
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			{#if team !== undefined}
				{#if team.id !== PendingValue}
					<!-- <Pagination
						totalCount={team.vulnerabilities.totalCount}
						pageInfo={team.vulnerabilities.pageInfo}
						on:nextPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasNextPage) return;
							TeamVulnerabilities.loadNextPage();
						}}
						on:previousPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasPreviousPage) return;
							TeamVulnerabilities.loadPreviousPage();
						}}
					/> -->
				{/if}
			{/if}
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

	.vulnerability {
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0.6;
	}

	.na {
		text-align: center;
	}

	.sbom {
		margin-left: 0.5rem;
	}
</style>
