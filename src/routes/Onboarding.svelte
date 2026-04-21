<script lang="ts">
	import TeamListItem from '$lib/domain/list-items/TeamListItem.svelte';
	import List from '$lib/ui/List.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { getContextClient } from '$lib/urql/context';
	import { BodyShort, Button, Heading, Loader, Search } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';
	import { queryStore } from '@urql/svelte';
	import {
		ONBOARDING_PAGE_SIZE,
		OnboardingTeamSearchQuery,
		OnboardingTeamsQuery
	} from './onboarding';

	interface Props {
		tenantName: string;
	}

	let { tenantName }: Props = $props();

	const client = getContextClient();

	let teamSearchQuery = $state('');
	let activeSearch = $state('');
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	/**
	 * Pagination cursors are kept in component state rather than the URL.
	 *
	 * Onboarding renders inside `+page.svelte`, whose `+page.ts` already
	 * owns the `?after` / `?before` query params for the `UserTeams`
	 * pagination. Hijacking those same params here would race with the
	 * parent route. Since the team-search input itself isn't reflected in
	 * the URL either, keeping the cursors local is consistent.
	 */
	let teamsCursor = $state<{ after?: string; before?: string }>({});
	let searchCursor = $state<{ after?: string; before?: string }>({});

	function paginationVariables(cursor: { after?: string; before?: string }) {
		if (cursor.before) {
			return { last: ONBOARDING_PAGE_SIZE, before: cursor.before };
		}
		return { first: ONBOARDING_PAGE_SIZE, after: cursor.after };
	}

	const teamsStore = $derived(
		queryStore({
			client,
			query: OnboardingTeamsQuery,
			variables: paginationVariables(teamsCursor)
		})
	);

	const searchStore = $derived(
		queryStore({
			client,
			query: OnboardingTeamSearchQuery,
			variables: {
				query: activeSearch,
				...paginationVariables(searchCursor)
			},
			pause: activeSearch === ''
		})
	);

	function onSearchInput() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
			searchTimeout = null;
		}

		searchTimeout = setTimeout(() => {
			searchCursor = {};
			activeSearch = teamSearchQuery;
		}, 250);
	}

	const teamsResult = $derived($teamsStore);
	const searchResult = $derived($searchStore);

	const teams = $derived(
		activeSearch === ''
			? teamsResult.data?.teams.nodes
			: (searchResult.data?.search.edges
					.map((e) => e.node)
					.filter((n) => n.__typename === 'Team') ?? teamsResult.data?.teams.nodes)
	);

	const pageInfo = $derived(
		activeSearch !== '' && searchResult.data
			? searchResult.data.search.pageInfo
			: teamsResult.data?.teams.pageInfo
	);

	const paginationLoaders = $derived(
		activeSearch === ''
			? {
					loadNextPage: () => {
						const end = teamsResult.data?.teams.pageInfo.endCursor;
						if (end) teamsCursor = { after: end };
					},
					loadPreviousPage: () => {
						const start = teamsResult.data?.teams.pageInfo.startCursor;
						if (start) teamsCursor = { before: start };
					}
				}
			: {
					loadNextPage: () => {
						const end = searchResult.data?.search.pageInfo.endCursor;
						if (end) searchCursor = { after: end };
					},
					loadPreviousPage: () => {
						const start = searchResult.data?.search.pageInfo.startCursor;
						if (start) searchCursor = { before: start };
					}
				}
	);
</script>

<div class="onboarding">
	<Heading as="h1" size="xlarge" spacing>Welcome to Nais Console! 🎉</Heading>
	{#if teamsResult.fetching && !teamsResult.data}
		<Loader size="3xlarge" />
	{:else if teams}
		<div class="content">
			<BodyShort>
				To get started you need to be part of a team. You can either find an existing team, or you
				can create a new one.
			</BodyShort>

			<Button as="a" size="medium" href="/team/create" variant="primary" icon={PlusIcon}>
				Create new team
			</Button>

			<div>
				<Heading as="h2" size="medium" spacing>Find a Team</Heading>
				<BodyShort spacing>
					Once you've found your team, ask one of the team owners to add you as a member.
				</BodyShort>
				<div class="search">
					<Search
						bind:value={teamSearchQuery}
						clearButton={false}
						oninput={onSearchInput}
						label="Team search"
						hideLabel
						size="small"
						variant="simple"
						placeholder="Find a team..."
					/>
					<List>
						{#each teams as team (team.slug)}
							<TeamListItem {team} />
						{:else}
							No teams found for query '{teamSearchQuery}'.
						{/each}
					</List>
					<Pagination page={pageInfo} loaders={paginationLoaders} />
				</div>
			</div>
		</div>
	{:else}
		<BodyShort spacing>To get started you need to create {tenantName}'s first team.</BodyShort>
		<Button as="a" size="medium" href="/team/create" variant="primary" icon={PlusIcon}>
			Create new team
		</Button>
	{/if}
</div>

<style>
	.onboarding {
		max-width: 1000px;
		margin-inline: auto;
		max-width: 620px;
	}
	.content {
		display: flex;
		flex-direction: column;
		align-items: start;
		gap: var(--ax-space-24);
	}
	.search {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-12);
	}
</style>
