<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import WorkloadLink from '$lib/components/WorkloadLink.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { resourceLink } from '$lib/utils/links';
	import {
		Alert,
		Link,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ BigQuery } = data);
	$: team = $BigQuery.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($BigQuery.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $BigQuery.errors}
	{#each distinctErrors($BigQuery.errors) as error}
		<Alert variant="error">
			{error}
		</Alert>
	{/each}
{:else if team}
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
				<Th sortable={true} sortKey="NAME">Name</Th>
				<Th sortable={true} sortKey="ENV">Env</Th>
				<Th>Owner</Th>
			</Thead>
			<Tbody>
				{#if team.id === PendingValue}
					<Tr>
						{#each new Array(4).fill('text') as variant}
							<Td>
								<Skeleton {variant} />
							</Td>
						{/each}
					</Tr>
				{:else}
					{#each team.bigQuery.nodes as node}
						<Tr>
							<Td>
								<Link href={resourceLink(node.env.name, teamName, 'bigquery', node.name)}
									>{node.name}</Link
								>
							</Td>
							<Td>
								{node.env.name}
							</Td>
							<Td>
								{#if node.workload}
									<WorkloadLink workload={node.workload} env={node.env.name} team={teamName} />
								{:else}
									<em>No owner</em>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No BigQuery s found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.bigQuery.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
{/if}
