<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Repositories } = data);
	$: team = $Repositories.data?.team;
</script>

{#if team && team !== undefined}
	<Card>
		<h3>Authorized repositories</h3>

		<Table size={'small'}>
			<Thead>
				<Tr>
					<Th>Repository</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each team.githubRepositories.edges as repo}
					<Tr>
						{#if repo.node.name === PendingValue}
							{#each new Array(1).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						{:else}
							<Td>{repo.node.name}</Td>
						{/if}
					</Tr>
				{/each}
			</Tbody>
		</Table>

		<Pagination
			pageInfo={team.githubRepositories.pageInfo}
			totalCount={team.githubRepositories.totalCount}
			on:nextPage={() => {
				if (!$Repositories.pageInfo.hasNextPage) return;
				Repositories.loadNextPage();
			}}
			on:previousPage={() => {
				if (!$Repositories.pageInfo.hasPreviousPage) return;
				Repositories.loadPreviousPage();
			}}
		/>
	</Card>
{:else}
	<p>Loading...</p>
{/if}

<style>
</style>
