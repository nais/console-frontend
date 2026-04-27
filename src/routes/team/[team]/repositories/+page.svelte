<script lang="ts">
	import { graphql, RepositoryOrderField } from '$houdini';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import {
		Alert,
		BodyLong,
		Button,
		Detail,
		Heading,
		Search,
		TextField
	} from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';

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

	let currentFilter = $derived($Repositories.variables?.filter?.name ?? '');
	let filter = $derived(currentFilter);
	let after: string = $derived($Repositories.variables?.after ?? '');
	let before: string = $derived($Repositories.variables?.before ?? '');
	let repositoryAdded = $state(false);
	let repositoryRemoved = $state(false);
	let repoOperatedOn = $state('');

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
		} = {},
		options = {}
	) => {
		clearSearchTimeout();

		changeParams(
			{
				before: params.before ?? before,
				after: params.after ?? after,
				filter: params.newFilter ?? currentFilter
			},
			options
		);
	};

	let searchTimeout: ReturnType<typeof setTimeout> | undefined = undefined;

	const clearSearchTimeout = () => {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
			searchTimeout = undefined;
		}
	};

	const applyFilter = (newFilter = filter) => {
		clearSearchTimeout();

		if (newFilter === currentFilter) {
			return;
		}

		changeQuery(
			{ before: '', after: '', newFilter },
			{ keepFocus: true, noScroll: true, replaceState: true }
		);
	};

	const onFilterChange = (newFilter: string) => {
		filter = newFilter;

		clearSearchTimeout();

		if (newFilter === '') {
			applyFilter('');
			return;
		}

		searchTimeout = setTimeout(() => {
			applyFilter(newFilter);
		}, 1000);
	};

	onDestroy(clearSearchTimeout);

	const onFilterKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			applyFilter();
			return;
		}

		if (event.key === 'Escape' && filter !== '') {
			event.preventDefault();
			filter = '';
			applyFilter('');
		}
	};

	let repoName = $state('');

	let inputError = $state(false);
	const errorMessage = `Invalid input`;

	const onRepositoryNameInput = () => {
		inputError = false;
	};
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
						<Heading as="h2" size="small">Add Repository</Heading>
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
								style="width: min(100%, 300px)"
								bind:value={repoName}
								oninput={onRepositoryNameInput}
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

				<Heading as="h2" size="small">Authorized Repositories</Heading>
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
					<div class="search">
						<Search
							clearButton={true}
							clearButtonLabel="Clear"
							label="filter repositories"
							placeholder="Filter by name"
							hideLabel={true}
							size="small"
							variant="simple"
							width="100%"
							autocomplete="off"
							bind:value={filter}
							onChange={onFilterChange}
							onkeydown={onFilterKeyDown}
							onclear={() => {
								filter = '';
								applyFilter('');
							}}
						/>
					</div>

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
										<div class="repo-row">
											<ExternalLink href="https://github.com/{repo.name}">{repo.name}</ExternalLink>
											{#if viewerIsMember}
												<div class="right">
													<div class="remove-btn-full">
														<Button
															variant="danger"
															size="xsmall"
															onclick={() => removeRepository(repo.team.slug, repo.name)}
															icon={TrashIcon}
														>
															Remove
														</Button>
													</div>
													<div class="remove-btn-icon">
														<Button
															variant="tertiary-neutral"
															size="xsmall"
															onclick={() => removeRepository(repo.team.slug, repo.name)}
															aria-label="Remove repository"
														>
															{#snippet icon()}
																<TrashIcon style="color: var(--ax-text-danger-decoration);" />
															{/snippet}
														</Button>
													</div>
												</div>
											{/if}
										</div>
									</ListItem>
								{/each}
							</List>
							<Pagination
								page={team.repositories.pageInfo}
								loaders={{
									loadPreviousPage: () =>
										changeQuery({
											after: '',
											before: team.repositories.pageInfo.startCursor ?? ''
										}),
									loadNextPage: () =>
										changeQuery({ before: '', after: team.repositories.pageInfo.endCursor ?? '' })
								}}
							/>
						</div>
					</div>
				{/if}
			{/if}
		</div>
		<div>
			<SidebarActivity
				activityLog={$Repositories.data.team}
				direct={$Repositories.data.team.activityLog}
			/>
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

	.search {
		display: flex;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.right {
		display: flex;
		gap: var(--ax-space-6);
		align-items: center;
	}

	.repo-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		gap: var(--ax-space-8);
	}
	code {
		font-size: 1rem;
	}

	@media (max-width: 767px) {
		.wrapper {
			grid-template-columns: 1fr;
		}

		.search {
			justify-content: stretch;
		}

		.remove-btn-full {
			display: none;
		}
	}

	@media (max-height: 500px) {
		.search {
			justify-content: stretch;
		}
	}

	@media (min-width: 768px) {
		.remove-btn-icon {
			display: none;
		}
	}
</style>
