<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, type VulnerabilitiesOrderByField$options } from '$houdini';
	import Card from '$lib/Card.svelte';
	import type { TableSortState } from '@nais/ds-svelte-community';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import Loading from '$lib/Loading.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Vulnerability from '$lib/components/Vulnerability.svelte';

	$: teamName = $page.params.team;
	export let data: PageData;
	$: ({ TeamVulnerabilities } = data);
	$: team = $TeamVulnerabilities.data?.team;
	$: vulns = $TeamVulnerabilities.data?.team?.vulnerabilitiesForTeam;

	const sort = (key) => {
		if (!sortState) {
			sortState = {
				orderBy: key,
				direction: 'descending'
			};
		} else if (sortState.orderBy === key) {
			if (sortState.direction === 'ascending') {
				sortState.direction = 'descending';
			} else {
				sortState.direction = 'ascending';
			}
		} else {
			sortState.orderBy = key;
			if (key === 'APP_NAME') {
				sortState.direction = 'ascending';
			} else {
				sortState.direction = 'descending';
			}
		}

		TeamVulnerabilities.fetch({
			variables: {
				team: teamName,
				orderBy: {
					field: key,
					direction: sortState.direction === 'descending' ? 'DESC' : 'ASC'
				}
			}
		});
	};
	let sortState: TableSortState = {
		orderBy: 'SEVERITY_CRITICAL',
		direction: 'descending'
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
					sort(key);
				}}
			>
				<Thead>
					<Th sortable={true} sortKey="APP_NAME">Name</Th>
					<Th sortable={true} sortKey="ENV_NAME">Env</Th>
					<Th>Findings</Th>
					<Th sortable={true} sortKey="SEVERITY_CRITICAL">Critical</Th>
					<Th sortable={true} sortKey="SEVERITY_HIGH">High</Th>
					<Th sortable={true} sortKey="SEVERITY_MEDIUM">Medium</Th>
					<Th sortable={true} sortKey="SEVERITY_LOW">Low</Th>
				</Thead>
				<Tbody>
					{#if team !== undefined}
						{#if team.id === PendingValue}
							<Tr>
								{#each new Array(team.vulnerabilitiesForTeam.edges.length).fill('medium') as size}
									<Td>
										<Loading {size} />
									</Td>
								{/each}
							</Tr>
						{:else}
							{#each team.vulnerabilitiesForTeam.edges as edge}
								<Tr>
									<Td>
										<a href="/team/{teamName}/{edge.node.env}/app/{edge.node.appName}"
											>{edge.node.appName}</a
										>
									</Td>
									<Td>{edge.node.env}</Td>
									{#if edge.node.project !== null}
										<Td>
											<a href={edge.node.project.findingsLink}>View</a>
										</Td>

										<Td>
											<Vulnerability
												severity="critical"
												count={edge.node.project?.summary?.critical}
											/>
										</Td>
										<Td>
											<Vulnerability severity="high" count={edge.node.project?.summary?.high} />
										</Td>
										<Td>
											<Vulnerability severity="medium" count={edge.node.project?.summary?.medium} />
										</Td>
										<Td>
											<Vulnerability severity="low" count={edge.node.project?.summary?.low} />
										</Td>
									{:else}
										<Td>
											<span style="color:lightslategray">No data found in dependencytrack</span>
										</Td>
										<Td><span class="na">-</span></Td>
										<Td><span class="na">-</span></Td>
										<Td><span class="na">-</span></Td>
										<Td><span class="na">-</span></Td>
									{/if}
								</Tr>
							{/each}
						{/if}
					{/if}
				</Tbody>
			</Table>
			{#if team !== undefined}
				{#if team.id !== PendingValue}
					<Pagination
						totalCount={team.vulnerabilitiesForTeam.totalCount}
						pageInfo={team.vulnerabilitiesForTeam.pageInfo}
						on:nextPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasNextPage) return;
							TeamVulnerabilities.loadNextPage();
						}}
						on:previousPage={() => {
							if (!$TeamVulnerabilities.pageInfo.hasPreviousPage) return;
							TeamVulnerabilities.loadPreviousPage();
						}}
					/>
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

	.na {
		padding-left: 10px;
		color: lightslategray;
	}

</style>
