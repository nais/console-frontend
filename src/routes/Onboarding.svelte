<script lang="ts">
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import { BodyLong, Box, Button, Heading, Search } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

	interface Props {
		tenantName: string;
	}

	let { tenantName }: Props = $props();

	const teamSearch = graphql(`
		query OnboardingTeamSearch($query: String!) {
			search(first: 5, filter: { type: TEAM, query: $query }) @paginate {
				edges {
					node {
						... on Team {
							slug
							purpose
						}
					}
				}
				pageInfo {
					totalCount
				}
			}
		}
	`);

	const teams = graphql(`
		query OnboardingTeams @load {
			teams(first: 5) @paginate {
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

	let teamSearchQuery = $state('');
	let teamSearchTimeout: ReturnType<typeof setTimeout> | null = null;

	function searchTeam() {
		if (teamSearchTimeout) {
			clearTimeout(teamSearchTimeout);
			teamSearchTimeout = null;
		}

		if (teamSearchQuery.length > 0) {
			teamSearchTimeout = setTimeout(() => {
				teamSearch.fetch({ variables: { query: teamSearchQuery } });
			}, 250);
		}
	}
</script>

<Card columns={12}>
	<Heading level="1" size="large" spacing={true}>Welcome to Nais Console! 🎉</Heading>
	{#if $teams.data && $teams.data.teams.pageInfo.totalCount === 0}
		<BodyLong>To get started you need to create {tenantName}’s first team.</BodyLong>
	{:else}
		<BodyLong>
			To get started you need to be part of a team. You can either find an existing team, or you can
			create a new one.
		</BodyLong>

		<div class="create">
			<!--Heading level="2" size="medium">Create a team</Heading>
			<BodyLong>You can create a new team and invite others to join.</BodyLong-->
			<div class="button">
				<Button as="a" size="medium" href="/team/create" variant="primary" icon={PlusIcon}>
					Create new team
				</Button>
			</div>
		</div>

		<div class="join">
			<Heading level="2" size="medium">Find a team</Heading>
			<BodyLong>
				Once you’ve found your team, ask one of the team owners to add you as a member.
			</BodyLong>
			<div class="search">
				<Search
					bind:value={teamSearchQuery}
					oninput={searchTeam}
					label="Team search"
					size="small"
					variant="simple"
					description="Search for a team"
					hideLabel={false}
				/>
			</div>

			{#if $teamSearch.data && teamSearchQuery !== ''}
				<div class="teams">
					{#each $teamSearch.data.search.edges.filter((n) => n.node.__typename === 'Team') as { node } (node.__typename === 'Team' ? node.slug : node)}
						{#if node.__typename === 'Team'}
							<Box
								as="a"
								background="surface-default"
								borderColor="border-default"
								padding="4"
								borderWidth="1"
								borderRadius="medium"
								href={`/team/${node.slug}/members`}
								class="box"
							>
								<h3>{node.slug}</h3>
								<span>{node.purpose}</span>
							</Box>
						{/if}
					{:else}
						<Box
							as="p"
							padding="4"
							background="surface-default"
							borderColor="border-default"
							borderWidth="1"
							borderRadius="medium"
						>
							Team '{teamSearchQuery}' not found. Please try searching again.
						</Box>
					{/each}
				</div>
			{:else if $teams.data}
				<div class="teams">
					{#each $teams.data.teams.nodes as team (team.slug)}
						<Box
							as="a"
							background="surface-default"
							borderColor="border-default"
							padding="4"
							borderWidth="1"
							borderRadius="medium"
							href={`/team/${team.slug}/members`}
							class="box"
						>
							<h3>{team.slug}</h3>
							<span>{team.purpose}</span>
						</Box>
					{/each}
					{#if $teams.data.teams.pageInfo.hasPreviousPage || $teams.data.teams.pageInfo.hasNextPage}
						<Pagination
							page={$teams.data.teams.pageInfo}
							loaders={{
								loadPreviousPage: () => {
									teams.loadPreviousPage();
								},
								loadNextPage: () => {
									teams.loadNextPage();
								}
							}}
						/>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</Card>

<style>
	.create {
		padding-top: 2rem;
	}

	.join {
		/*display: grid;*/
		gap: 1rem;
		padding-top: 2rem;
	}

	.search {
		padding: 1rem 0;
	}

	.teams {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		:global(.box) {
			text-decoration: none;
			color: var(--a-text-default);
			display: block;
			> * {
				text-decoration: none;
				color: var(--a-text-default);
			}
			h3 {
				margin: 0;
				font-size: 1.2rem;
			}
			&:hover {
				h3 {
					text-decoration: underline;
					color: var(--a-text-action-hover);
				}
				box-shadow: var(--a-shadow-large);
				border-color: var(--ac-link-panel-hover-border, var(--a-border-action));
			}
			&:active,
			&:focus {
				background-color: var(--a-surface-subtle);
			}
		}
	}
</style>
