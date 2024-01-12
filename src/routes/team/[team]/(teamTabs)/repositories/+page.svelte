<script lang="ts">
	import { page } from '$app/stores';
	import { PendingValue, RepositoryAuthorization, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { sortTable } from '$lib/pagination';
	import {
		Button,
		HelpText,
		Link,
		Table,
		Tbody,
		Td,
		Th,
		Thead,
		Tr,
		type TableSortState
	} from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	/*
	TODO: FIX THIS
	*/

	export let data: PageData;

	$: ({ Repositories, TeamRoles } = data);
	$: team = $Repositories.data?.team;

	$: teamRoles = $TeamRoles.data?.team;

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

	const refetch = () => {
		Repositories.fetch({
			variables: {
				team: teamName
			}
		});
	};

	const authorizeRepositoryForDeploy = graphql(`
		mutation AuthorizeRepository(
			$authorization: RepositoryAuthorization!
			$repository: String!
			$team: Slug!
		) {
			authorizeRepository(authorization: $authorization, repoName: $repository, teamSlug: $team) {
				slug
				# authorizations
			}
		}
	`);

	const deauthorizeRepositoryForDeploy = graphql(`
		mutation DeauthorizeRepository(
			$authorization: RepositoryAuthorization!
			$repository: String!
			$team: Slug!
		) {
			deauthorizeRepository(authorization: $authorization, repoName: $repository, teamSlug: $team) {
				slug
				# authorizations
			}
		}
	`);

	const authorizeDeploy = (team: string, repository: string) => {
		authorizeRepositoryForDeploy.mutate({
			authorization: RepositoryAuthorization.DEPLOY,
			repository,
			team
		});
	};
	const deauthorizeDeploy = (team: string, repository: string) => {
		deauthorizeRepositoryForDeploy.mutate({
			authorization: RepositoryAuthorization.DEPLOY,
			repository,
			team
		});
	};
</script>

{#if team && team !== undefined}
	<Card>
		<h3>Repositories</h3>

		<Table
			size="small"
			sort={sortState}
			on:sortChange={(e) => {
				const { key } = e.detail;
				sortState = sortTable(key, sortState);
			}}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey="NAME">Repository</Th>
					{#if teamRoles && teamRoles !== PendingValue && teamRoles.viewerIsMember}
						<Th>Deploy</Th>
						<Th sortable={true} sortKey="ROLE">Role</Th>
					{/if}
				</Tr>
			</Thead>
			<Tbody>
				{#each team.githubRepositories.edges as repo}
					<Tr>
						<Td><Link href="https://github.com/{repo.node.name}">{repo.node.name}</Link></Td>
						{#if teamRoles && teamRoles !== PendingValue && teamRoles.viewerIsMember}
							{#if repo.node.authorizations !== null && repo.node.name !== null}
								<Td>
									{#if repo.node.authorizations.includes('DEPLOY')}
										<Button
											size="xsmall"
											variant="danger"
											on:click={() => {
												deauthorizeDeploy(teamName, repo.node.name);
											}}>Deauthorize</Button
										>
									{:else}
										<Button
											size="xsmall"
											variant="primary-neutral"
											on:click={() => {
												authorizeDeploy(teamName, repo.node.name);
											}}>Authorize</Button
										>
									{/if}
								</Td>
							{/if}
							<Td
								><div class="roleHelpText">
									{repo.node.roleName}<HelpText placement={'left'} title="Role description"
										>The team's role for the repository.<br />{repo.node.roleName.toUpperCase()}: {roleDesc(
											repo.node.roleName.toUpperCase()
										)}</HelpText
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
