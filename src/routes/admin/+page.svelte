<script lang="ts">
	import { page } from '$app/state';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { AdminUsers } = $derived(data);
</script>

{#if AdminUsers.data}
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
			{#each AdminUsers.data.users.nodes || [] as user (user.id)}
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
		page={AdminUsers.data.users.pageInfo}
		loaders={cursorPaginationLoaders(page.url, AdminUsers.data.users.pageInfo)}
	/>
{/if}
