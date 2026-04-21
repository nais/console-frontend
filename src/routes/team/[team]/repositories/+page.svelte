<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import SidebarActivity from '$lib/domain/activity/sidebar/SidebarActivity.svelte';
	import ExternalLink from '$lib/ui/ExternalLink.svelte';
	import GraphErrors from '$lib/ui/GraphErrors.svelte';
	import List from '$lib/ui/List.svelte';
	import ListItem from '$lib/ui/ListItem.svelte';
	import OrderByMenu from '$lib/ui/OrderByMenu.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { RepositoryOrderField } from '$lib/urql/gql/graphql';
	import { cursorPaginationLoaders } from '$lib/urql/pagination';
	import { changeParams } from '$lib/utils/searchparams';
	import { Alert, BodyLong, Button, Detail, Heading, TextField } from '@nais/ds-svelte-community';
	import { PlusIcon, TrashIcon } from '@nais/ds-svelte-community/icons';
	import type { PageProps } from './$types';
	import { AddRepositoryMutation, RemoveRepositoryMutation } from './repositories';

	let { data }: PageProps = $props();

	let { Repositories, teamSlug, viewerIsMember } = $derived(data);

	const client = getContextClient();

	const addRepository = async (team: string, repository: string) => {
		await client.mutation(AddRepositoryMutation, { repository, team }).toPromise();
		void invalidateAll();
		repositoryAdded = true;
		repoOperatedOn = repository;
		setTimeout(() => {
			repositoryAdded = false;
		}, 10000);
	};

	const removeRepository = async (team: string, repository: string) => {
		await client.mutation(RemoveRepositoryMutation, { repository, team }).toPromise();
		void invalidateAll();
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

	let filter = $state(page.url.searchParams.get('filter') ?? '');
	let repositoryAdded = $state(false);
	let repositoryRemoved = $state(false);
	let repoOperatedOn = $state('');

	const handleFilter = () => {
		changeParams({ filter, before: '', after: '' });
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

<GraphErrors errors={Repositories.errors} />

{#if Repositories.data}
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
			{#if Repositories.data.team}
				{@const team = Repositories.data.team}
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
										<ExternalLink href="https://github.com/{repo.name}">{repo.name}</ExternalLink>
										{#if viewerIsMember}
											<div class="right">
												<Button
													variant="danger"
													size="xsmall"
													onclick={() => removeRepository(repo.team.slug, repo.name)}
													icon={TrashIcon}
												>
													Remove
												</Button>
											</div>
										{/if}
									</ListItem>
								{/each}
							</List>
							<Pagination
								page={team.repositories.pageInfo}
								loaders={cursorPaginationLoaders(page.url, team.repositories.pageInfo)}
							/>
						</div>
					</div>
				{/if}
			{/if}
		</div>
		<div>
			<SidebarActivity activityLog={Repositories.data.team} />
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
		gap: var(--ax-space-6);
		align-items: center;
	}
	code {
		font-size: 1rem;
	}
</style>
