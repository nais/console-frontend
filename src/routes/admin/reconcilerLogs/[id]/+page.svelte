<script lang="ts">
	import Pagination from '$lib/Pagination.svelte';
	import Time from '$lib/Time.svelte';
	import { Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { ReconcilerLogs } = $derived(data);
</script>

{#if $ReconcilerLogs.data && $ReconcilerLogs.data.node?.__typename === 'Reconciler'}
	<Heading level="2">{$ReconcilerLogs.data.node.displayName} logs</Heading>
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
				{#each $ReconcilerLogs.data.node.errors.nodes as error (error.correlationID)}
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
	.message {
		word-break: break-word;
		white-space: pre-line;
	}
</style>
