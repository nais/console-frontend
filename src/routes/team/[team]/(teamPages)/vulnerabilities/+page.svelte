<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import { OrderByField, type OrderByField$options } from '$houdini/graphql';
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
		Select,
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

	let defaultSortCol: OrderByField$options = OrderByField.RISK_SCORE;
	let defaultSortDir: 'descending' | 'ascending' = 'descending';

	$: ({ sortState, limit, offset } = tableStateFromVariables(
		$TeamVulnerabilities.variables,
		defaultSortCol,
		defaultSortDir
	));

	const onClick = () => {
		let props = {};
		props = {
			routeID: '/dependencytrack/team/findings'
		};
		logEvent('pageview', props);
	};

	const sortChange = (e: CustomEvent<{ key: string }>) => {
		const { key } = e.detail;
		const ss = sortTable(key, sortState);
		defaultSortCol = ss.orderBy as OrderByField$options;
		defaultSortDir = ss.direction;
		changeParams({ col: ss.orderBy, dir: tableGraphDirection[ss.direction] });
	};

	let selectedEnvironment: string = '';
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
			<h3>Current vulnerabilities for each application</h3>

			{#if team !== undefined && team.id !== PendingValue}
				<div class="env-filter">
					<Select
						size="small"
						hideLabel={true}
						bind:value={selectedEnvironment}
						on:change={() => {
							changeParams({ env: selectedEnvironment });
						}}
						label="Environment"
					>
						<option value="">All environments</option>
						{#each team.environments as env}
							<option value={env.name}>{env.name}</option>
						{/each}
					</Select>
				</div>
			{/if}

			<Table size="small" sort={sortState} on:sortChange={sortChange}>
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
						{#each team.vulnerabilities.nodes as node}
							{#if node === PendingValue}
								<Tr>
									{#each new Array(9).fill('text') as variant}
										<Td>
											<Skeleton height="32px" {variant} />
										</Td>
									{/each}
								</Tr>
							{:else}
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
															content="SBOM could not be parsed. Check NAIS Salsa documentation"
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
												href="https://doc.nav.cloud.nais.io/security/salsa/salsa/#slsa-in-nais"
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
							{/if}
						{:else}
							<Tr>
								<Td colspan={9}>No applications with vulnerability data found</Td>
							</Tr>
						{/each}
					{/if}
				</Tbody>
			</Table>
			{#if team?.vulnerabilities.pageInfo !== PendingValue}
				<Pagination
					style="padding-top: 1rem;"
					pageInfo={team?.vulnerabilities.pageInfo}
					{limit}
					{offset}
					changePage={(e) => {
						changeParams({ page: e.toString() });
					}}
				/>
			{/if}
		</Card>
		<Card columns={12}>
			<VulnerabilitiesGraph team={teamName} />
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

	.env-filter {
		display: flex;
		margin-bottom: 1rem;
	}
</style>
