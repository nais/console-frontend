<script lang="ts">
	import { page } from '$app/state';
	import Pagination from '$lib/ui/Pagination.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ReconcilerLogs } = $derived(data);
</script>

{#if ReconcilerLogs.data && ReconcilerLogs.data.node?.__typename === 'Reconciler'}
	{@const node = ReconcilerLogs.data.node}
	<Table size="small">
		<Thead>
			<Tr>
				<Th>Message</Th>
				<Th>Team</Th>
				<Th>Timestamp</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#each node.errors.nodes as error (error.id)}
				<Tr>
					<Td><span class="message">{error.message}</span></Td>
					<Td><a href="/team/{error.team.slug}">{error.team.slug}</a></Td>
					<Td><Time time={error.createdAt} distance={true} /></Td>
				</Tr>
			{:else}
				<Tr><Td colspan={999}><em>No reconciler errors at the moment.</em></Td></Tr>
			{/each}
		</Tbody>
	</Table>
	{#if node.errors.pageInfo.hasPreviousPage || node.errors.pageInfo.hasNextPage}
		<Pagination
			page={node.errors.pageInfo}
			loaders={cursorPaginationLoaders(page.url, node.errors.pageInfo)}
		/>
	{/if}
{/if}

<style>
	.message {
		word-break: break-word;
		white-space: pre-line;
	}
</style>
