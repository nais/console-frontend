<script lang="ts">
	import { page } from '$app/state';
	import { ActivityLogActivityType, graphql, OrderDirection, RepositoryOrderField } from '$houdini';
	import TeamActivityCard from '$lib/domain/activity/TeamActivityCard.svelte';
	import GitHubIcon from '$lib/icons/GitHubIcon.svelte';
	import CollapsibleSidebar from '$lib/ui/CollapsibleSidebar.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListFilters from '$lib/ui/ListFilters.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import SurfaceCard from '$lib/ui/SurfaceCard.svelte';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, Button, Detail, Heading, Modal, TextField } from '@nais/ds-svelte-community';
	import { FunnelIcon, PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let filtersOpen = $state(false);
	let { Repositories, teamSlug, viewerIsMember } = $derived(data);

	type RepositoryOrderFieldOptions =
		(typeof RepositoryOrderField)[keyof typeof RepositoryOrderField];
	type OrderDirectionOptions = (typeof OrderDirection)[keyof typeof OrderDirection];

	const sortFields: { value: RepositoryOrderFieldOptions; label: string }[] = [
		{ value: RepositoryOrderField.NAME, label: 'Name' }
	];

	const currentSortField: RepositoryOrderFieldOptions = $derived(
		(Object.values(RepositoryOrderField).find((f) =>
			page.url.searchParams.get('sort')?.startsWith(f)
		) as RepositoryOrderFieldOptions | undefined) ?? RepositoryOrderField.NAME
	);

	const currentSortDirection: OrderDirectionOptions = $derived(
		(Object.values(OrderDirection).find((d) => page.url.searchParams.get('sort')?.endsWith(d)) as
			| OrderDirectionOptions
			| undefined) ?? OrderDirection.ASC
	);

	function setSort(field: RepositoryOrderFieldOptions) {
		const direction =
			field === currentSortField
				? currentSortDirection === OrderDirection.ASC
					? OrderDirection.DESC
					: OrderDirection.ASC
				: OrderDirection.ASC;
		changeParams({ sort: `${field}-${direction}`, after: '', before: '' });
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
			addModalOpen = false;
		} else {
			inputError = true;
		}
	};

	let currentFilter = $derived($Repositories.variables?.filter?.name ?? '');
	let filter = $state(page.url.searchParams.get('filter') ?? '');
	let after: string = $derived($Repositories.variables?.after ?? '');
	let before: string = $derived($Repositories.variables?.before ?? '');
	let repositoryAdded = $state(false);
	let repositoryRemoved = $state(false);
	let repoOperatedOn = $state('');
	let addModalOpen = $state(false);

	const changeQuery = (
		params: {
			after?: string;
			before?: string;
			newFilter?: string;
		} = {}
	) => {
		changeParams({
			before: params.before ?? before,
			after: params.after ?? after,
			filter: params.newFilter ?? currentFilter
		});
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

				<List title="Repositories" count={team.repositories.pageInfo.totalCount}>
					{#snippet actions()}
						{#if viewerIsMember}
							<Button
								variant="secondary"
								size="small"
								onclick={() => (addModalOpen = true)}
								icon={PlusIcon}
							>
								Add Repository
							</Button>
						{/if}
						<button class="sidebar-toggle" onclick={() => (filtersOpen = !filtersOpen)}>
							<FunnelIcon aria-hidden="true" style="font-size: 1rem" />
							Filters
						</button>
					{/snippet}
					{#each team.repositories.edges as { node: repo } (repo.id)}
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
		<CollapsibleSidebar bind:open={filtersOpen}>
			<SurfaceCard title="Filters">
				<ListFilters
					{filter}
					searchPlaceholder="Filter by name"
					searchLabel="Filter repositories"
					{sortFields}
					{currentSortField}
					{currentSortDirection}
					onFilterInput={(v) => (filter = v)}
					onFilterSubmit={() => changeQuery({ newFilter: filter })}
					onFilterClear={() => {
						filter = '';
						changeQuery({ newFilter: '' });
					}}
					onSort={(field) => setSort(field as RepositoryOrderFieldOptions)}
				/>
			</SurfaceCard>
			{#snippet extras()}
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
			{/snippet}
		</CollapsibleSidebar>
	</div>

	<Modal bind:open={addModalOpen} width="small" onclose={() => (addModalOpen = false)}>
		{#snippet header()}
			<Heading as="h2" size="medium">Add Repository</Heading>
		{/snippet}
		<Detail spacing>
			Adding a repository will grant it access to deployment actions on behalf of the team.
		</Detail>
		<form
			onsubmit={(e: SubmitEvent) => {
				e.preventDefault();
				handleSubmit();
			}}
		>
			<TextField
				size="small"
				type="text"
				id="repositoryName"
				bind:value={repoName}
				oninput={onRepositoryNameInput}
				error={inputError ? errorMessage : undefined}
			>
				{#snippet label()}
					Repository name
				{/snippet}
				{#snippet description()}
					Format: &lt;organization&gt;/&lt;repository&gt;
				{/snippet}
			</TextField>
			<div class="modal-actions">
				<Button size="small" variant="primary" type="submit" icon={PlusIcon}>Add</Button>
				<Button size="small" variant="tertiary" onclick={() => (addModalOpen = false)}
					>Cancel</Button
				>
			</div>
		</form>
	</Modal>
{/if}

<style>
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

	.modal-actions {
		display: flex;
		gap: var(--ax-space-8);
		margin-top: var(--ax-space-16);
	}

	code {
		font-size: 1rem;
	}
</style>
