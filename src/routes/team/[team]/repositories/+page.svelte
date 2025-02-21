<script lang="ts">
	import { page } from '$app/state';
	import { graphql, RepositoryOrderField } from '$houdini';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams.svelte';
	import {
		Button,
		Detail,
		Heading,
		Table,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Repositories, teamSlug } = $derived(data);

	const addRepositoryMutation = graphql(`
		mutation AddRepository($repository: String!, $team: Slug!) {
			addRepositoryToTeam(input: { repositoryName: $repository, teamSlug: $team }) {
				repository {
					name
				}
			}
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
			removeRepositoryFromTeam(input: { repositoryName: $repository, teamSlug: $team }) {
				success
			}
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
		if (validateRepo(repoName)) {
			addRepository(teamSlug, repoName);
			inputError = false;
			repoName = '';
		} else {
			inputError = true;
		}
	};

	let filter = $state('');

	const handleFilter = () => {
		if (filter === '') {
			page.url.searchParams.delete('filter');
		} else {
			page.url.searchParams.set('filter', filter);
		}
		history.replaceState({}, '', page.url.toString());
		Repositories.fetch({ variables: { team: teamSlug, filter: { name: filter } } });
	};

	let searchTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	const onKeyUp = (e: KeyboardEvent) => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		if (e.key === 'Enter') {
			handleFilter();
			return;
		} else if (e.key === 'Escape') {
			filter = '';
			handleFilter();
			return;
		}

		searchTimeout = setTimeout(() => {
			handleFilter();
		}, 1000);
	};

	let tableSort = $derived({
		orderBy: $Repositories.variables?.orderBy?.field,
		direction: $Repositories.variables?.orderBy?.direction
	});

	const tableSortChange = (key: string) => {
		if (key === tableSort.orderBy) {
			const direction = tableSort.direction === 'ASC' ? 'DESC' : 'ASC';
			tableSort.direction = direction;
		} else {
			tableSort.orderBy = RepositoryOrderField[key as keyof typeof RepositoryOrderField];
			tableSort.direction = 'ASC';
		}

		changeParams({
			direction: tableSort.direction,
			field: tableSort.orderBy || RepositoryOrderField.NAME
		});
	};

	let repoName = $state('');

	let inputError = $state(false);
	const errorMessage = `Invalid input`;
</script>

<GraphErrors errors={$Repositories.errors} />

{#if $Repositories.data}
	<div class="wrapper">
		<div>
			{#if $Repositories.data.team}
				{@const team = $Repositories.data.team}
				{#if team.viewerIsOwner || team.viewerIsMember}
					<div class="repository">
						<Heading level="2" size="small">Add repository</Heading>
						<Detail>
							Adding a repository will grant it access to deployment actions on behalf of the team.</Detail
						>
						<form
							onsubmit={(e: SubmitEvent) => {
								e.preventDefault();
								handleSubmit();
							}}
							class="input"
						>
							<TextField
								size="small"
								type="text"
								id="repositoryName"
								style="width: 300px"
								bind:value={repoName}
								error={inputError ? errorMessage : undefined}
							>
								{#snippet label()}
									Repository name
								{/snippet}
								{#snippet description()}
									GitHub repository and organization names can include alphanumeric characters,
									hyphens, and underscores, and must follow the format
									&lt;organization&gt;/&lt;repository&gt;.
								{/snippet}
							</TextField>
							<div style="margin-top: 1rem;">
								<Button size="small" variant="secondary" type="submit" icon={PlusIcon}>Add</Button>
							</div>
						</form>
					</div>
				{/if}

				<Heading level="2" size="small">Authorized repositories</Heading>

				<form class="input">
					<TextField
						size="small"
						type="text"
						id="filter"
						style="width: 300px;"
						bind:value={filter}
						onkeyup={onKeyUp}
					>
						{#snippet label()}
							Filter repositories
						{/snippet}
					</TextField>
				</form>

				<Table
					size="small"
					sort={{
						orderBy: tableSort.orderBy || RepositoryOrderField.NAME,
						direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
					}}
					onsortchange={tableSortChange}
				>
					<Thead>
						<Tr>
							<Th sortable={true} sortKey={RepositoryOrderField.NAME}>Name</Th>
							<Th style="width:150px">Action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each team.repositories.nodes as repo (repo.id)}
							<Tr>
								<Td><a href="https://github.com/{repo.name}" target="_blank">{repo.name}</a></Td>
								<Td>
									<Button
										variant="secondary"
										size="small"
										disabled={!team.viewerIsOwner && !team.viewerIsMember}
										onclick={() => removeRepository(repo.team.slug, repo.name)}
										icon={TrashIcon}
									>
										Remove
									</Button>
								</Td>
							</Tr>
						{:else}
							<Tr>
								<Td colspan={999}>No repositories found</Td>
							</Tr>
						{/each}
					</Tbody>
				</Table>
				<Pagination
					page={team.repositories.pageInfo}
					loaders={{
						loadNextPage: () => {
							Repositories.loadNextPage();
						},
						loadPreviousPage: () => {
							Repositories.loadPreviousPage();
						}
					}}
				/>
			{/if}
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--a-spacing-12);
	}

	.input {
		font-size: 1rem;
		margin: 1rem 0;
	}
</style>
