<script lang="ts">
	import Pagination from '$lib/ui/Pagination.svelte';
	import Time from '$lib/ui/Time.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { ReconcilerLogs } = $derived(data);
</script>

{#if $ReconcilerLogs.data && $ReconcilerLogs.data.node?.__typename === 'Reconciler'}
	<div class="table-container">
		<Table size="small">
			<Thead>
				<Tr>
					<Th>Message</Th>
					<Th>Team</Th>
					<Th>Timestamp</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#if $ReconcilerLogs.data}
					{#each $ReconcilerLogs.data.node.errors.nodes as error (error.id)}
						<Tr>
							<Td><span class="message">{error.message}</span></Td>
							<Td><a href="/team/{error.team.slug}">{error.team.slug}</a></Td>
							<Td><Time time={error.createdAt} distance={true} /></Td>
						</Tr>
					{:else}
						<Tr><Td colspan={999}><em>No reconciler errors at the moment.</em></Td></Tr>
					{/each}
				{/if}
			</Tbody>
		</Table>
	</div>
	{#if $ReconcilerLogs.data.node.errors.pageInfo.hasPreviousPage || $ReconcilerLogs.data.node.errors.pageInfo.hasNextPage}
		<Pagination
			page={$ReconcilerLogs.data.node.errors.pageInfo}
			loaders={{
				loadPreviousPage: () => {
					ReconcilerLogs.loadPreviousPage();
				},
				loadNextPage: () => {
					ReconcilerLogs.loadNextPage();
				}
			}}
		/>
	{/if}
{/if}

<style>
	.table-container {
		max-width: 100%;
		min-width: 0;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		-webkit-overflow-scrolling: touch;
	}

	.table-container :global(table) {
		width: max-content;
		min-width: 100%;
	}

	.message {
		word-break: break-word;
		white-space: pre-line;
	}
</style>
