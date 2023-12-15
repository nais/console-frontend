<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { Alert, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

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
		<Table size="small" zebraStripes={true}>
			<Thead>
				<Th>Name</Th>
				<Th>E-mail</Th>
				<Th>Role</Th>
			</Thead>
			<Tbody>
				{#each team.members.nodes as node}
					<Tr>
						{#if team.slug === PendingValue}
							{#each new Array(3).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						{:else}
							<Td>{capitalizeFirstLetterInEachWord(node.user.name.toString())}</Td>
							<Td>{node.user.email}</Td>
							<Td>{node.role.toString().toLowerCase()}</Td>
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>
		<!-- <Pagination
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
		/> -->
	</Card>
{/if}
