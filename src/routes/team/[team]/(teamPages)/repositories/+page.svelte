<script lang="ts">
	import { page } from '$app/stores';
	import { RepositoryAuthorization, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams, limitOffset, sortTable } from '$lib/pagination';
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

	$: ({ Repositories } = data);
	$: team = $Repositories.data?.team;

	$: teamName = $page.params.team;

	$: ({ limit, offset } = limitOffset($Repositories.variables));

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
				return 'Give ISOC the opportunity to follow up';
			default:
				return 'Unknown role';
		}
	};

	const authorizeRepositoryForDeploy = graphql(`
		mutation AuthorizeRepository(
			$authorization: RepositoryAuthorization!
			$repository: String!
			$team: Slug!
		) {
			authorizeRepository(authorization: $authorization, repoName: $repository, teamSlug: $team) {
				authorizations
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
				authorizations
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

{#if team}
	<Card>
		<h3>Repositories</h3>

		<Table
			size="small"
			sort={sortState}
			zebraStripes
			on:sortChange={(e) => {
				const { key } = e.detail;
				sortState = sortTable(key, sortState);
			}}
		>
			<Thead>
				<Tr>
					<Th sortable={true} sortKey="NAME">Repository</Th>
					{#if data.viewerIsMember}
						<Th>Deploy</Th>
						<Th sortable={true} sortKey="ROLE">Role</Th>
					{/if}
				</Tr>
			</Thead>
			<Tbody>
				{#each team.githubRepositories.nodes as repo}
					<Tr>
						<Td><Link href="https://github.com/{repo.name}">{repo.name}</Link></Td>
						{#if data.viewerIsMember}
							{#if repo.authorizations !== null && repo.name !== null}
								<Td>
									{#if repo.authorizations.includes('DEPLOY')}
										<Button
											size="xsmall"
											variant="danger"
											on:click={() => {
												deauthorizeDeploy(teamName, repo.name);
											}}
										>
											Deauthorize
										</Button>
									{:else}
										<Button
											size="xsmall"
											variant="primary-neutral"
											on:click={() => {
												authorizeDeploy(teamName, repo.name);
											}}
										>
											Authorize
										</Button>
									{/if}
								</Td>
							{/if}
							<Td>
								<div class="roleHelpText">
									{repo.roleName}
									<HelpText placement={'left'} title="Role description">
										The team's role for the repository.<br />{repo.roleName.toUpperCase()}:
										{roleDesc(repo.roleName.toUpperCase())}
									</HelpText>
								</div>
							</Td>
						{/if}
					</Tr>
				{:else}
					<Tr>
						<Td colspan={99} style="background:var(--a-surface-info-subtle)">
							No GitHub repositories for this team. You can link a repository to this team by giving
							the team permissions on the repository on GitHub.
						</Td>
					</Tr>
				{/each}
			</Tbody>
		</Table>

		<Pagination
			pageInfo={team.githubRepositories.pageInfo}
			{limit}
			{offset}
			changePage={(page) => {
				changeParams({ page: page.toString() });
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
