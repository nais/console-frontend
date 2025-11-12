<script lang="ts">
	import { graphql } from '$houdini';
	import List from '$lib/ui/List.svelte';
	import TeamListItem from '$lib/domain/list-items/TeamListItem.svelte';
	import Pagination from '$lib/ui/Pagination.svelte';
	import { BodyShort, Button, Heading, Loader, Search } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		tenantName: string;
	}

	let { tenantName }: Props = $props();

	const teamSearch = graphql(`
		query OnboardingTeamSearch($query: String!, $after: Cursor, $before: Cursor) {
			search(first: 25, after: $after, before: $before, filter: { type: TEAM, query: $query })
				@paginate {
				edges {
					node {
						... on Team {
							slug
							purpose
						}
					}
				}
				pageInfo {
					hasNextPage
					hasPreviousPage
					pageStart
					pageEnd
					totalCount
					startCursor
					endCursor
				}
			}
		}
	`);

	const teamsQuery = graphql(`
		query OnboardingTeams {
			teams(first: 25) @paginate {
				pageInfo {
					hasNextPage
					hasPreviousPage
					pageStart
					pageEnd
					totalCount
					startCursor
					endCursor
				}
				nodes {
					slug
					purpose
				}
			}
		}
	`);

	$effect.pre(() => {
		teamsQuery.fetch();
	});

	let teamSearchQuery = $state('');
	let teamSearchTimeout: ReturnType<typeof setTimeout> | null = null;

	function searchTeam() {
		if (teamSearchTimeout) {
			clearTimeout(teamSearchTimeout);
			teamSearchTimeout = null;
		}

		if (teamSearchQuery.length > 0) {
			teamSearchTimeout = setTimeout(() => {
				teamSearch.fetch({
					variables: {
						query: teamSearchQuery,
						after: null,
						before: null
					}
				});
			}, 250);
		}
	}

	const teams = $derived(
		teamSearchQuery === ''
			? $teamsQuery.data?.teams.nodes
			: ($teamSearch.data?.search.edges.map((e) => e.node).filter((n) => n.__typename === 'Team') ??
					$teamsQuery.data?.teams.nodes)
	);

	const pagination = $derived(
		$teamSearch.data
			? {
					page: $teamSearch.data.search.pageInfo,
					loaders: {
						loadPreviousPage: () => teamSearch.loadPreviousPage(),
						loadNextPage: () => teamSearch.loadNextPage()
					}
				}
			: {
					page: $teamsQuery.data?.teams.pageInfo,
					loaders: {
						loadPreviousPage: () => teamsQuery.loadPreviousPage(),
						loadNextPage: () => teamsQuery.loadNextPage()
					}
				}
	);
</script>

<div class="onboarding">
	<Heading level="1" size="xlarge" spacing>Welcome to Nais Console! 🎉</Heading>
	{#if $teamsQuery.fetching}
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
				<Heading level="2" size="medium" spacing>Find a Team</Heading>
				<BodyShort spacing>
					Once you've found your team, ask one of the team owners to add you as a member.
				</BodyShort>
				<div class="search">
					<Search
						bind:value={teamSearchQuery}
						clearButton={false}
						oninput={searchTeam}
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
					<Pagination {...pagination} />
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
