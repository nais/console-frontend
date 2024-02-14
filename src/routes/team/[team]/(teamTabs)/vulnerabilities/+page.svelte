<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import { OrderByField } from '$houdini/graphql';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { logEvent } from '$lib/amplitude';
	import VulnerabilitiesGraph from '$lib/components/VulnerabilitiesGraph.svelte';
	import Vulnerability from '$lib/components/Vulnerability.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
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
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ TeamVulnerabilities } = data);
	$: team = $TeamVulnerabilities.data?.team;

	$: teamName = $page.params.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables(
		$TeamVulnerabilities.variables,
		OrderByField.SEVERITY_CRITICAL,
		'descending'
	));

	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/team/findings'
		};
		logEvent('pageview', props);
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
			<VulnerabilitiesGraph team={teamName} />
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
							{:else}
								<Tr>
									<Td colspan={9}>No applications with vulnerability data found</Td>
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			{#if team?.vulnerabilities.pageInfo !== PendingValue}
				<Pagination
					pageInfo={team?.vulnerabilities.pageInfo}
					{limit}
					{offset}
					changePage={(e) => {
						changeParams({ page: e.toString() });
					}}
				/>
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
