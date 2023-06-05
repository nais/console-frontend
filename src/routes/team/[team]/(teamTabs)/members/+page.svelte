<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Members } = data);
</script>

{#if $Members.data}
	<Card>
		<h3>Members</h3>
		<Table>
			<Thead>
				<Th>Name</Th>
				<Th>E-mail</Th>
				<Th>Role</Th>
			</Thead>
			<Tbody>
				{#each $Members.data.team.members.edges as edge}
					<Tr>
						<Td>{edge.node.name}</Td>
						<Td>{edge.node.email}</Td>
						<Td>{edge.node.role.toLowerCase()}</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>
		<Pagination
			pageInfo={$Members.data.team.members.pageInfo}
			totalCount={$Members.data.team.members.totalCount}
			on:nextPage={() => {
				if (!$Members.pageInfo.hasNextPage) return;
				Members.loadNextPage();
			}}
			on:previousPage={() => {
				if (!$Members.pageInfo.hasPreviousPage) return;
				Members.loadPreviousPage();
			}}
		/>
	</Card>
{/if}
