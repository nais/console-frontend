<script lang="ts">
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { UserSyncLogs } = $derived(data);
</script>

<GraphErrors errors={$UserSyncLogs.errors} />
{#if $UserSyncLogs.data}
	<Table size="small">
		<Thead>
			<Tr>
				<Th>Action</Th>
				<Th>Name</Th>
				<Th>Email</Th>
				<Th>Timestamp</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each $UserSyncLogs.data.userSyncLog.nodes || [] as entry (entry.id)}
				<Tr>
					<Td>
						{#if entry.__typename === 'RoleAssignedUserSyncLogEntry'}
							Assigned role <em>{entry.roleName}</em>
						{:else if entry.__typename === 'RoleRevokedUserSyncLogEntry'}
							Revoked role <em>{entry.roleName}</em>
						{:else}
							{entry.message}
						{/if}
					</Td>
					<Td>
						{entry.userName}
						{#if entry.__typename === 'UserUpdatedUserSyncLogEntry' && entry.oldUserName !== entry.userName}
							<span class="old-value">{entry.oldUserName}</span>
						{/if}
					</Td>
					<Td>
						{entry.userEmail}
						{#if entry.__typename === 'UserUpdatedUserSyncLogEntry' && entry.oldUserEmail !== entry.userEmail}
							<span class="old-value">{entry.oldUserEmail}</span>
						{/if}
					</Td>
					<Td><Time time={entry.createdAt} distance={true} /></Td>
				</Tr>
			{:else}
				<Tr>
					<Td colspan={99}>No user sync log entries found</Td>
				</Tr>
			{/each}
		</Tbody>
	</Table>

	<Pagination
		page={$UserSyncLogs.data.userSyncLog.pageInfo}
		loaders={{
			loadNextPage: () => {
				UserSyncLogs.loadNextPage();
			},
			loadPreviousPage: () => {
				UserSyncLogs.loadPreviousPage();
			}
		}}
	/>
{/if}

<style>
	.old-value {
		text-decoration: line-through;
	}
</style>
