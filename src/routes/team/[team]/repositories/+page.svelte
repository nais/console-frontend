<script lang="ts">
	import { page } from '$app/state';
	import { graphql, RepositoryOrderField } from '$houdini';
	import List from '$lib/components/list/List.svelte';
	import ListItem from '$lib/components/list/ListItem.svelte';
	import OrderByMenu from '$lib/components/OrderByMenu.svelte';
	import GraphErrors from '$lib/GraphErrors.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, BodyLong, Button, Detail, Heading, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$houdini';

	let { data }: PageProps = $props();

	let { Repositories, teamSlug, viewerIsMember } = $derived(data);

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
		repositoryAdded = true;
		repoOperatedOn = repository;
		setTimeout(() => {
			repositoryAdded = false;
		}, 10000);
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
		repositoryRemoved = true;
		repoOperatedOn = repository;
		setTimeout(() => {
			repositoryRemoved = false;
		}, 10000);
	};

	const validateRepo = (input: string) => {
		const pattern = /^[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+$/;
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
	let repositoryAdded = $state(false);
	let repositoryRemoved = $state(false);
	let repoOperatedOn = $state('');

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

	let repoName = $state('');

	let inputError = $state(false);
	const errorMessage = `Invalid input`;
</script>

<GraphErrors errors={$Repositories.errors} />

{#if $Repositories.data}
	{#if repositoryAdded}
		<div style="margin-bottom: var(--spacing-layout)">
			<Alert variant="success" size="small" fullWidth={true}
				>Repository <code>{repoOperatedOn}</code> added successfully. It might take a couple of minutes
				before the repository is authorized.</Alert
			>
		</div>
	{/if}

	{#if repositoryRemoved}
		<div style="margin-bottom: var(--spacing-layout)">
			<Alert variant="success" size="small" fullWidth={true}
				>Repository <code>{repoOperatedOn}</code> removed successfully.</Alert
			>
		</div>
	{/if}

	<div class="wrapper">
		<div>
			{#if $Repositories.data.team}
				{@const team = $Repositories.data.team}
				{#if viewerIsMember}
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
				{#if team.repositories.pageInfo.totalCount === 0 && filter === ''}
					<BodyLong spacing>
						{#if team.repositories.pageInfo.totalCount == 0}
							<strong>No repositories are authorized for deployment.</strong>
						{/if}
						To enable GitHub Actions to deploy your application, add a repository to the list.
						<a
							href="https://docs.dev-nais.cloud.nais.io/tutorials/hello-nais/#authorize-the-repository-for-deployment"
							>Learn more.</a
						>
					</BodyLong>
				{:else}
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

					<div>
						<div>
							<List title="{team.repositories.pageInfo.totalCount} entries">
								{#snippet menu()}
									<OrderByMenu
										orderField={RepositoryOrderField}
										defaultOrderField={RepositoryOrderField.NAME}
									/>
								{/snippet}
								{#each team.repositories.nodes as repo (repo.id)}
									<ListItem>
										<a href="https://github.com/{repo.name}" target="_blank">{repo.name}</a>

										<div class="right">
											<Button
												variant="danger"
												size="xsmall"
												disabled={!team.viewerIsOwner && !team.viewerIsMember}
												onclick={() => removeRepository(repo.team.slug, repo.name)}
												icon={TrashIcon}
											>
												Remove
											</Button>
										</div>
									</ListItem>
								{/each}
							</List>
							<Pagination
								page={team.repositories.pageInfo}
								loaders={{
									loadPreviousPage: () =>
										changeParams({
											after: '',
											before: team.repositories.pageInfo.startCursor ?? ''
										}),
									loadNextPage: () =>
										changeParams({ before: '', after: team.repositories.pageInfo.endCursor ?? '' })
								}}
							/>
						</div>
					</div>
				{/if}
			{/if}
		</div>
	</div>
{/if}

<style>
	.wrapper {
		display: grid;
		grid-template-columns: 1fr 300px;
		gap: var(--spacing-layout);
	}

	.input {
		font-size: 1rem;
		margin: 1rem 0;
	}
	.right {
		display: flex;
		gap: var(--a-spacing-1-alt);
		align-items: center;
	}
	code {
		font-size: 1rem;
	}
</style>
