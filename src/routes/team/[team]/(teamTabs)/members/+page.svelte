<script lang="ts">
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Alert, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import { PendingValue } from '$houdini';
	import Loading from '$lib/Loading.svelte';

	export let data: PageData;
	$: ({ Members } = data);
	$: team = $Members.data?.team;

	function capitalizeFirstLetterInEachWord(str: string): string {
		return str.replaceAll(/(^|\s)[\w]/g, (c) => c.toUpperCase());
	}
</script>

{#if $Members.errors}
	<Alert variant="error">
		{#each $Members.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if team}
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
							<Td>{capitalizeFirstLetterInEachWord(edge.node.name.toString())}</Td>
							<Td>{edge.node.email}</Td>
							<Td>{edge.node.role.toString().toLowerCase()}</Td>
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
{/if}
