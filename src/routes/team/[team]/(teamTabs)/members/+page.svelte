<script lang="ts">
	import { PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import {
		Alert,
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';
	import AddMember from './AddMember.svelte';

	export let data: PageData;
	$: ({ Members } = data);
	$: team = $Members.data?.team;

	$: ({ limit, offset } = limitOffset($Members.variables));

	function capitalizeFirstLetterInEachWord(str: string): string {
		return str.replaceAll(/(^|\s)[\w]/g, (c) => c.toUpperCase());
	}

	let addMemberOpen = false;
</script>

{#if $Members.errors}
	<Alert variant="error">
		{#each $Members.errors as error}
			{error.message}
		{/each}
	</Alert>
{:else if team}
	<Card>
		<div class="header">
			<h3>Members</h3>
			<Button
				size="small"
				on:click={() => {
					addMemberOpen = !addMemberOpen;
				}}><svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>Add member</Button
			>
		</div>

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
		<Pagination
			pageInfo={team.members.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
			}}
		/>
	</Card>
	{#if team && team.slug != PendingValue}
		<AddMember
			bind:open={addMemberOpen}
			team={team.slug}
			on:created={() => {
				Members.fetch({
					policy: 'NetworkOnly'
				});
			}}
		/>
	{/if}
{/if}

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}
	.header h3 {
		margin: 0;
	}
</style>
