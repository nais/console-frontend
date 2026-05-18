<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, graphql, OrderDirection, RepositoryOrderField } from '$houdini';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, Button, Detail, Search, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon, SortDownIcon, SortUpIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import { onDestroy } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let { Repositories, teamSlug, viewerIsMember } = $derived(data);

	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function toggleSort() {
		const direction =
			currentSortDirection === OrderDirection.ASC ? OrderDirection.DESC : OrderDirection.ASC;
		changeParams({ sort: `${RepositoryOrderField.NAME}-${direction}`, after: '', before: '' });
	}

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
	let searchContainer = $state<HTMLDivElement | undefined>(undefined);
	let pendingFocusedFilter = $state<string | undefined>(undefined);

	const focusSearchField = (attemptsLeft = 4) => {
		const input = searchContainer?.querySelector<HTMLInputElement>('input[type="search"]');

		if (!input) {
			if (attemptsLeft > 0) {
				requestAnimationFrame(() => {
					focusSearchField(attemptsLeft - 1);
				});
				return;
			}

			pendingFocusedFilter = undefined;
			return;
		}

		input.focus();

		if (document.activeElement === input) {
			pendingFocusedFilter = undefined;
			return;
		}

		if (attemptsLeft > 0) {
			requestAnimationFrame(() => {
				focusSearchField(attemptsLeft - 1);
			});
			return;
		}

		pendingFocusedFilter = undefined;
	};

	// This effect only handles post-render DOM focus after the Search component remounts.
	$effect(() => {
		const requestedFilter = pendingFocusedFilter;
		const appliedFilter = currentFilter;
		const container = searchContainer;

		if (requestedFilter === undefined || appliedFilter !== requestedFilter || !container) {
			return;
		}

		requestAnimationFrame(() => {
			focusSearchField();
		});
	});

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
		} = {},
		options = {}
	) => {
		clearSearchTimeout();
		pendingFocusedFilter = params.newFilter;

		void changeParams(
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

	<div class="layout-two-column">
		<div>
			{#if $Repositories.data.team}
				{@const team = $Repositories.data.team}
				{#if viewerIsMember}
					<details class="add-repository">
						<summary class="add-repository-heading">Add Repository</summary>
						<div class="add-repository-content">
							<Detail>
								Adding a repository will grant it access to deployment actions on behalf of the
								team.
							</Detail>
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
								<div style="margin-top: var(--ax-space-8);">
									<Button size="small" variant="secondary" type="submit" icon={PlusIcon}>Add</Button
									>
								</div>
							</form>
						</div>
					</details>
				{/if}

				<List title="Repositories" count={team.repositories.pageInfo.totalCount}>
					{#snippet actions()}
						<Button
							variant="tertiary-neutral"
							size="small"
							onclick={toggleSort}
							title="Sort by name ({currentSortDirection === 'ASC' ? 'ascending' : 'descending'})"
						>
							{#snippet icon()}
								{#if currentSortDirection === 'ASC'}
									<SortUpIcon />
								{:else}
									<SortDownIcon />
								{/if}
							{/snippet}
						</Button>
					{/snippet}
					{#snippet search()}
						<div bind:this={searchContainer}>
							<Search
								clearButton={true}
								clearButtonLabel="Clear"
								label="filter repositories"
								placeholder="Filter by name"
								hideLabel={true}
								size="small"
								variant="simple"
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
					{/snippet}
					{#each team.repositories.nodes as repo (repo.id)}
						<ListItem interactive>
							<div class="repo-row">
								<div class="repo-name">
									<GitHubIcon />
									<ExternalLink href="https://github.com/{repo.name}">{repo.name}</ExternalLink>
								</div>
								{#if viewerIsMember}
									<div class="right">
										<Button
											variant="tertiary-neutral"
											size="xsmall"
											onclick={() => removeRepository(repo.team.slug, repo.name)}
											aria-label="Remove repository"
											title="Remove repository"
										>
											{#snippet icon()}
												<TrashIcon style="color: var(--ax-text-danger-decoration);" />
											{/snippet}
										</Button>
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
			{/if}
		</div>
		<div class="layout-sidebar" style="gap: var(--ax-space-16)">
			<TeamActivityCard
				{teamSlug}
				viewAllHref="/team/{teamSlug}/activity-log"
				filter={{
					activityTypes: [
						ActivityLogActivityType.REPOSITORY_ADDED,
						ActivityLogActivityType.REPOSITORY_REMOVED
					]
				}}
			/>
		</div>
	</div>
{/if}

<style>
	.add-repository {
		margin-bottom: var(--ax-space-16);
		border: 1px solid var(--ax-border-neutral-subtleA);
		border-radius: var(--ax-radius-8);
		padding: var(--ax-space-12) var(--ax-space-16);
	}

	.add-repository-heading {
		font-weight: 600;
		font-size: var(--ax-font-size-medium);
		cursor: pointer;
		list-style: none;
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.add-repository-heading::before {
		content: '›';
		display: inline-block;
		transition: transform 0.2s;
		font-size: 1.2em;
	}

	.add-repository[open] > .add-repository-heading::before {
		transform: rotate(90deg);
	}

	.add-repository-heading::-webkit-details-marker {
		display: none;
	}

	.add-repository-content {
		padding-top: var(--ax-space-12);
	}

	.input {
		font-size: 1rem;
		margin: var(--ax-space-8) 0;
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

	.repo-name {
		display: flex;
		align-items: center;
		gap: var(--ax-space-6);
	}

	code {
		font-size: 1rem;
	}
</style>
