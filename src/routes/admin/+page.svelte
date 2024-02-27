<script lang="ts">
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import { Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import SyncRuns from './SyncRuns.svelte';

	export let data: PageData;

	$: ({ AdminUsers } = data);
	$: ({ limit, offset } = limitOffset($AdminUsers.variables));

	const synchronize = graphql(`
		mutation SynchronizeUsers {
			synchronizeUsers
		}
	`);

	let errors: string[] = [];

	let loading = false;
	const triggerSynchronize = async () => {
		loading = true;
		const resp = await synchronize.mutate(null);
		loading = false;
		if (resp.errors) {
			errors = resp.errors.filter((e) => e.message != 'unable to resolve').map((e) => e.message);
		}
	};
</script>

<div class="h">
	<Button disabled={loading} {loading} on:click={triggerSynchronize} size="small">
		Synchronize users
	</Button>
</div>

<br />

{#each errors as e}
	<p>{e}</p>
{/each}

<Card>
	<h2>User sync logs</h2>
	<SyncRuns />
</Card>
<br />
<Card>
	<h2>Users</h2>
	{#if $AdminUsers.data}
		<Table zebraStripes>
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
						<Td>{user.externalId}</Td>
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
			style="margin-top: 1rem;"
			pageInfo={$AdminUsers.data.users.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
			}}
		/>
	{/if}
</Card>

<style>
	.h {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
</style>
