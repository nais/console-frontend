<script lang="ts">
	import Time from '$lib/Time.svelte';
	import { Button, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { ReconcilerLogs } = $derived(data);
</script>

{#if $ReconcilerLogs.data && $ReconcilerLogs.data.node?.__typename === 'Reconciler'}
	<Heading level="2">{$ReconcilerLogs.data.node.displayName} logs</Heading>
	<Table size="small" zebraStripes>
		<Thead>
			<Tr>
				<Th>Message</Th>
				<Th>Team</Th>
				<Th>Timestamp</Th>
			</Tr>
		</Thead>
		<Tbody>
			{#if $ReconcilerLogs.data}
				{#each $ReconcilerLogs.data.node.errors.nodes as error}
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
		<div class="pagination">
			<span>
				{#if $ReconcilerLogs.data.node.errors.pageInfo.pageStart !== $ReconcilerLogs.data.node.errors.pageInfo.pageEnd}
					{$ReconcilerLogs.data.node.errors.pageInfo.pageStart} - {$ReconcilerLogs.data.node.errors
						.pageInfo.pageEnd}
				{:else}
					{$ReconcilerLogs.data.node.errors.pageInfo.pageStart}
				{/if}

				of {$ReconcilerLogs.data.node.errors.pageInfo.totalCount}
			</span>

			<span style="padding-left: 1rem;">
				<Button
					size="small"
					variant="secondary"
					disabled={!$ReconcilerLogs.data.node.errors.pageInfo.hasPreviousPage}
					onclick={async () => {
						return await ReconcilerLogs.loadPreviousPage();
					}}><ChevronLeftIcon /></Button
				>
				<Button
					size="small"
					variant="secondary"
					disabled={!$ReconcilerLogs.data.node.errors.pageInfo.hasNextPage}
					onclick={async () => {
						return await ReconcilerLogs.loadNextPage();
					}}
				>
					<ChevronRightIcon /></Button
				>
			</span>
		</div>
	{/if}
{/if}

<style>
	.message {
		word-break: break-word;
		white-space: pre-line;
	}
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
