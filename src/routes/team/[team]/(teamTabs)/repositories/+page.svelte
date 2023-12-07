<script lang="ts">
	import { page } from '$app/stores';
	import { OrderByField, PendingValue } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import {
		HelpText,
		Skeleton,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import { sortTable } from '../../../../../helpers';
	import type { PageData } from './$houdini';

	export let data: PageData;

	$: ({ Repositories } = data);
	$: team = $Repositories.data?.team;

	$: console.log(team);

	$: teamName = $page.params.team;

	let sortState: TableSortState = {
		orderBy: 'NAME',
		direction: 'ascending'
	};

	const roleDesc = (role: string) => {
		switch (role) {
			case 'TRIAGE':
				return 'Can read and clone this repository. Can also manage issues and pull requests.';
			case 'READ':
				return 'Can read and clone this repository. Can also open and comment on issues and pull requests.';
			case 'WRITE':
				return 'Can read, clone, and push to this repository. Can also manage issues and pull requests.';
			case 'MAINTAIN':
				return 'Can read, clone, and push to this repository. They can also manage issues, pull requests, and some repository settings.';
			case 'ADMIN':
				return 'Can read, clone, and push to this repository. Can also manage issues, pull requests, and repository settings, including adding collaborators.';
			case 'ISOC_TRIAGE_FOLLOWUP':
				return 'Gir ISOC mulighet til å følge opp';
			default:
				return 'Ukjent rolle';
		}
	};

	const refetch = (key: string) => {
		const field = Object.values(OrderByField).find((value) => value === key);
		Repositories.fetch({
			variables: {
				team: teamName,
				orderBy: {
					field: field !== undefined ? field : 'NAME',
					direction: sortState.direction === 'descending' ? 'DESC' : 'ASC'
				}
			}
		});
	};
	/*
	Triage
Can read and clone this repository. Can also manage issues and pull requests.

Read
Can read and clone this repository. Can also open and comment on issues and
										pull requests.

										Write
Can read, clone, and push to this repository. Can also manage issues and pull requests.

Maintain
Can read, clone, and push to this repository. They can also manage issues, pull requests, and some repository settings.

Admin
Can read, clone, and push to this repository. Can also manage issues, pull requests, and repository settings, including adding collaborators.

ISOC Triage & Follow up
Gir ISOC mulighet til å følge opp
	*/
</script>

{#if team && team !== undefined}
	<Card>
		<h3>Authorized repositories</h3>

		<Table
			size="small"
			sort={sortState}
			on:sortChange={(e) => {
				const { key } = e.detail;
				sortState = sortTable(key, sortState, refetch);
			}}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey="NAME">Repository</Th>
					<Th>Authorizations</Th>
					<Th sortable={true} sortKey="ROLE">Role</Th>
				</Tr>
			</Thead>
			<Tbody>
				{#each team.githubRepositories.edges as repo}
					<Tr>
						{#if repo.node.name === PendingValue}
							{#each new Array(3).fill('text') as variant}
								<Td><Skeleton {variant} /></Td>
							{/each}
						{:else}
							<Td>{repo.node.name}</Td>
							<Td>{repo.node.authorizations}</Td>
							<Td
								><div class="roleHelpText">
									{repo.node.roleName}<HelpText placement={'left'} title="Role description"
										>{roleDesc(repo.node.roleName.toUpperCase())}</HelpText
									>
								</div></Td
							>
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
{/if}

<style>
	.roleHelpText {
		display: flex;
		gap: 0.5rem;
		font-family: monospace;
		font-size: 1rem;
	}
</style>
