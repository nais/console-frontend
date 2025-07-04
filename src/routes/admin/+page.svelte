<script lang="ts">
	import Pagination from '$lib/Pagination.svelte';
	import { Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { AdminUsers } = $derived(data);
</script>

<Heading level="2" size="medium" spacing>Users</Heading>
{#if $AdminUsers.data}
	<Table size="small">
		<Thead>
			<Tr>
				<Th>Name</Th>
				<Th>Email</Th>
				<Th>External ID</Th>
				<Th>Nais admin</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each $AdminUsers.data.users.nodes || [] as user (user.id)}
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
			loadNextPage: () => {
				AdminUsers.loadNextPage();
			},
			loadPreviousPage: () => {
				AdminUsers.loadPreviousPage();
			}
		}}
	/>
{/if}
