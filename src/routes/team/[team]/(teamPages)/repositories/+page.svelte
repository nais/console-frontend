<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { page } from '$app/stores';
	import { graphql, PendingValue, RepositoryOrderField } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Button,
		Skeleton,
		Table,
		Tbody,
		Td,
		TextField,
		Th,
		Thead,
		Tr
	} from '@nais/ds-svelte-community';
	import {
		ChevronLeftIcon,
		ChevronRightIcon,
		PlusIcon,
		TrashIcon
	} from '@nais/ds-svelte-community/icons';
	import type { PageData } from './$houdini';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let { Repositories } = $derived(data);

	let teamName = $derived($page.params.team);

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
			addRepository(teamName, repoName);
			inputError = false;
			repoName = '';
		} else {
			inputError = true;
		}
	};

	let filter = $state('');

	const handleFilter = () => {
		if (filter === '') {
			$page.url.searchParams.delete('filter');
		} else {
			$page.url.searchParams.set('filter', filter);
		}
		history.replaceState({}, '', $page.url.toString());
		Repositories.fetch({ variables: { team: teamName, filter: { name: filter } } });
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

{#if $Repositories.data}
	<div class="grid">
		{#if $Repositories.data.team}
			{@const team = $Repositories.data.team}
			{#if (team.viewerIsOwner !== PendingValue && team.viewerIsOwner) || (team.viewerIsMember !== PendingValue && team.viewerIsMember)}
				<Card>
					<div class="repository">
						<h3>Add repository</h3>
						<em
							>Adding a repository will grant it access to deployment actions on behalf of the team.</em
						>
						<form onsubmit={preventDefault(handleSubmit)} class="input">
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
								<Button size="small" variant="secondary" type="submit" iconLeft={PlusIcon}>
									Add
								</Button>
							</div>
						</form>
					</div>
				</Card>
			{/if}

			<Card>
				<h3>Repositories</h3>

				<form class="input">
					<TextField
						size="small"
						type="text"
						id="filter"
						style="width: 300px;"
						bind:value={filter}
						onKeyup={onKeyUp}
					>
						{#snippet label()}
							Filter repositories
						{/snippet}
					</TextField>
				</form>

				<Table
					size="small"
					zebraStripes
					sort={{
						orderBy: tableSort.orderBy || RepositoryOrderField.NAME,
						direction: tableSort.direction === 'ASC' ? 'ascending' : 'descending'
					}}
					onSortChange={tableSortChange}
				>
					<Thead>
						<Tr>
							<Th sortable={true} sortKey={RepositoryOrderField.NAME}>Name</Th>
							<Th style="width:150px">Action</Th>
						</Tr>
					</Thead>
					<Tbody>
						{#each team.repositories.nodes as repo}
							{#if repo === PendingValue}
								<Tr>
									<Td>
										<Skeleton variant="text" />
									</Td>
									<Td>
										<Button variant="secondary" size="small" disabled={true} iconLeft={TrashIcon}>
											Remove
										</Button>
									</Td>
								</Tr>
							{:else}
								<Tr>
									<Td><a href="https://github.com/{repo.name}" target="_blank">{repo.name}</a></Td>
									<Td>
										<Button
											variant="secondary"
											size="small"
											disabled={!team.viewerIsOwner && !team.viewerIsMember}
											onClick={() => removeRepository(repo.team.slug, repo.name)}
											iconLeft={TrashIcon}
										>
											Remove
										</Button>
									</Td>
								</Tr>
							{/if}
						{/each}
					</Tbody>
				</Table>
				{#if team.repositories.pageInfo !== PendingValue}
					{#if team.repositories.pageInfo.hasPreviousPage || team.repositories.pageInfo.hasNextPage}
						<div class="pagination">
							<span>
								{#if team.repositories.pageInfo.pageStart !== team.repositories.pageInfo.pageEnd}
									{team.repositories.pageInfo.pageStart} - {team.repositories.pageInfo.pageEnd}
								{:else}
									{team.repositories.pageInfo.pageStart}
								{/if}

								of {team.repositories.pageInfo.totalCount}
							</span>

							<span style="padding-left: 1rem;">
								<Button
									size="small"
									variant="secondary"
									disabled={!team.repositories.pageInfo.hasPreviousPage}
									onClick={async () => {
										return await Repositories.loadPreviousPage();
									}}><ChevronLeftIcon /></Button
								>
								<Button
									size="small"
									variant="secondary"
									disabled={!team.repositories.pageInfo.hasNextPage}
									onClick={async () => {
										return await Repositories.loadNextPage();
									}}
								>
									<ChevronRightIcon /></Button
								>
							</span>
						</div>
					{/if}
				{/if}
			</Card>
		{/if}
	</div>
{/if}

<style>
	.input {
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

	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
