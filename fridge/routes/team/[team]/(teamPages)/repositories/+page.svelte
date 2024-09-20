<script lang="ts">
	import { page } from '$app/stores';
	import { AuditEventResourceType, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import ActivityLog from '$lib/components/ActivityLog.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import { Button, Table, Tbody, Td, TextField, Th, Thead, Tr } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

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

	const validateRepo = (input: string) => {
		const pattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+$/;
		return pattern.test(input);
	};

	const handleSubmit = () => {
		console.log(`Adding repository: ${repoName}`);
		if (validateRepo(repoName)) {
			console.log(`Valid GitHub repository: ${repoName}`);
			addRepository(teamName, repoName);
			inputError = false;
			repoName = '';
		} else {
			inputError = true;
		}
	};

	let repoName = '';
	let inputError = false;
	const errorMessage = `Invalid input`;
</script>

{#if team}
	<div class="grid">
		{#if team.viewerIsOwner || team.viewerIsMember}
			<Card>
				<div class="repository">
					<h3>Add repository</h3>
					<em
						>Adding a repository will grant it access to deployment actions on behalf of the team.</em
					>
					<form on:submit|preventDefault={handleSubmit} class="input">
						<TextField
							size="small"
							type="text"
							id="repositoryName"
							style="width: 300px"
							bind:value={repoName}
							error={inputError ? errorMessage : undefined}
						>
							<svelte:fragment slot="label">Repository name</svelte:fragment>
							<svelte:fragment slot="description"
								>GitHub repository and organization names can include alphanumeric characters,
								hyphens, and underscores, and must follow the format
								&lt;organization&gt;/&lt;repository&gt;.
							</svelte:fragment>
						</TextField>
						<div style="margin-top: 1rem;">
							<Button size="small" variant="secondary" type="submit">
								<svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>
								Add
							</Button>
						</div>
					</form>
				</div>
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
	.input {
		font-family: monospace;
		font-size: 1rem;
		margin: 1rem 0;
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
