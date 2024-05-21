<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import {
		changeParams,
		sortTable,
		tableGraphDirection,
		tableStateFromVariables
	} from '$lib/pagination';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: teamName = $page.params.team;
	$: ({ Redis } = data);
	$: team = $Redis.data?.team;

	$: ({ sortState, limit, offset } = tableStateFromVariables($Redis.variables));
	const distinctErrors = (errors: { message: string }[]) => new Set(errors.map((e) => e.message));
</script>

{#if $Redis.errors}
	{#each distinctErrors($Redis.errors) as error}
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
						{#each new Array(3).fill('text') as variant}
							<Td><Skeleton {variant} /></Td>
						{/each}
					</Tr>
				{:else}
					{#each team.redis.nodes as node}
						<Tr>
							<!-- TODO: show warning if no workload uses this instance -->
							<Td>
								{node.name}
							</Td>
							<Td>
								{node.env.name}
							</Td>
							<Td>
								{#if node.workload}
									<a
										href="/team/{teamName}/{node.env.name}/{node.workload?.__typename === 'App'
											? 'app'
											: 'job'}/{node.workload.name}">{node.workload.name}</a
									>
								{:else}
									<em title="The Redis instance is owned by the team">Team</em>
								{/if}
							</Td>
						</Tr>
					{:else}
						<Tr>
							<Td colspan={999}>No Redis' found</Td>
						</Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={team?.redis.pageInfo}
			{limit}
			{offset}
			changePage={(e) => {
				changeParams({ page: e.toString() });
			}}
		/>
	</Card>
{/if}