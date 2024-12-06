<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import SyncRuns from './SyncRuns.svelte';

	export let data: PageData;

	$: ({ AdminUsers } = data);
</script>

<br />

<Card>
	<h2>User sync logs</h2>
	<SyncRuns />
</Card>
<br />
<Card>
	<h2>Users</h2>
	{#if $AdminUsers.data}
		<Table zebraStripes size="small">
			<Thead>
				<Tr>
					<Th>Name</Th>
					<Th>Email</Th>
					<Th>External ID</Th>
					<Th>Nais admin</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each $AdminUsers.data.users.nodes || [] as user}
					<Tr>
						<Td>{user.name}</Td>
						<Td>{user.email}</Td>
						<Td>{user.externalID}</Td>
						<Td>{user.isAdmin ? 'Yes' : ''}</Td>
					</Tr>
				{:else}
					<Tr>
						<Td colspan={99}>No users found</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>

		<Pagination
			page={$AdminUsers.data.users.pageInfo}
			loaders={{
				loadNextPage: async () => {
					await AdminUsers.loadNextPage();
				},
				loadPreviousPage: async () => {
					await AdminUsers.loadPreviousPage();
				}
			}}
		/>
	{/if}
</Card>
