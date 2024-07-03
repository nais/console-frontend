<script lang="ts">
	import { page } from '$app/stores';
	import { AuditEventResourceType, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import { HelpText, Button, Table, Tbody, Td, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';
	import ActivityLog from '$lib/components/ActivityLog.svelte';

	export let data: PageData;

	$: ({ Repositories } = data);
	$: team = $Repositories.data?.team;
	$: teamName = $page.params.team;
	$: ({ limit, offset } = limitOffset($Repositories.variables));

	const addRepositoryMutation = graphql(`
		mutation AddRepository($repository: String!, $team: Slug!) {
			addRepository(repoName: $repository, teamSlug: $team)
		}
	`);
	const addRepository = async (team: string, repository: string) => {
		await addRepositoryMutation.mutate({
			repository,
			team
		});
		Repositories.fetch();
	};

	const removeRepositoryMutation = graphql(`
		mutation RemoveRepository($repository: String!, $team: Slug!) {
			removeRepository(repoName: $repository, teamSlug: $team)
		}
	`);
	const removeRepository = async (team: string, repository: string) => {
		await removeRepositoryMutation.mutate({
			repository,
			team
		});
		Repositories.fetch();
	};

	let repoName = '';
	let inputError = false;
</script>

{#if team}
	<div class="grid">
		{#if team.viewerIsOwner || team.viewerIsMember}
		<Card>
			<div class="repository">
				<h3>Add repository <HelpText title="Description">Adding a repository will grant it access to deployment actions on behalf of the team.</HelpText></h3>
				<div class="roleHelpText">
					<input
						type="text"
						id="repositoryName"
						style="width: 300px"
						placeholder="e.g. `navikt/my-repo`"
						bind:value={repoName}
					/>
					<Button
						size="small"
						variant="secondary"
						on:click={() => {
							if (!repoName.match(/^[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+$/i)) {
								inputError = true;
								return;
							}
							addRepository(teamName, repoName);
							repoName = '';
							inputError = false;
						}}
					>
						<svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>
						Add
					</Button>
				</div>
			</div>
			{#if inputError}
				<p style="color: red">Invalid repository name, must be on format: 'org/reponame'</p>
			{/if}
		</Card>
		{/if}
		<Card>
			<h3>Repositories</h3>
			<Table size="small" zebraStripes>
				<Thead>
					<Th>Name</Th>
					<Th style="width:150px">Action</Th>
				</Thead>
				<Tbody>
					{#each team.repositories.nodes as repo}
						<Tr>
							<Td><a href="https://github.com/{repo}" target="_blank">{repo}</a></Td>
							<Td>
								<Button
									variant="secondary"
									size="small"
									disabled={!team.viewerIsOwner && !team.viewerIsMember}
									on:click={() => removeRepository(teamName, repo)}
								>
									<svelte:fragment slot="icon-left"><TrashIcon /></svelte:fragment>
									Remove
								</Button>
							</Td>
						</Tr>
					{/each}
				</Tbody>
			</Table>
			<Pagination
				pageInfo={team.repositories.pageInfo}
				{limit}
				{offset}
				changePage={(e) => {
					changeParams({ page: e.toString() });
				}}
			/>
		</Card>
		{#key team}
			<ActivityLog resourceType={AuditEventResourceType.TEAM_REPOSITORY} {teamName} />
		{/key}
	</div>
{/if}

<style>
	.roleHelpText {
		display: flex;
		gap: 0.5rem;
		font-family: monospace;
		font-size: 1rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 1rem;
	}
	.repository > h3 {
		display: flex;
		gap: 1rem;
	}
</style>
