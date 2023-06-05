<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	export let data: PageData;
	$: ({ Members } = data);
	$: team = $Members.data.team;
</script>

<Card>
	<h3>Members</h3>
	<Table>
		<Thead>
			<Th>Name</Th>
			<Th>E-mail</Th>
			<Th>Role</Th>
		</Thead>
		<Tbody>
			{#each team.members.edges as edge}
				<Tr>
					{#if team.name === PendingValue}
						{#each new Array(3) as _}
							<Td><Loading /></Td>
						{/each}
					{:else}
						<Td>{edge.node.name}</Td>
						<Td>{edge.node.email}</Td>
						<Td>{edge.node.role.toLowerCase()}</Td>
					{/if}
				</Tr>
			{/each}
		</Tbody>
	</Table>
	<Pagination
		pageInfo={team.members.pageInfo}
		totalCount={team.members.totalCount}
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
