<script lang="ts">
	import { graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import { BodyLong, Box, Button, Heading, Search } from '@nais/ds-svelte-community';
	import { PlusIcon } from '@nais/ds-svelte-community/icons';

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
	<Heading level="1" size="large">Welcome to Nais Console!</Heading>
	<BodyLong>
		Looks like you're not a member of any teams yet. To get started with the Nais platform, you need
		to join a team.<br />
		You can either create a new team or request to join an existing one.
	</BodyLong>

	<div class="split">
		<div class="join">
			<Heading level="2" size="medium">Join a team</Heading>
			<BodyLong>
				To join a team, you need to be added by a team member of the desired team. You can search
				for the team in the search box below and ask a team member to add you.
			</BodyLong>

			<Search
				bind:value={teamSearchQuery}
				oninput={searchTeam}
				label="Team search"
				size="small"
				variant="simple"
				description="Search for a team"
				hideLabel={false}
			/>

			{#if $teamSearch.data}
				<div class="teams">
					{#each $teamSearch.data.search.edges as { node }}
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
							Team {teamSearchQuery} not found. Please try another search.
						</Box>
					{/each}
				</div>
			{/if}
		</div>
		<div class="create">
			<Heading level="2" size="medium">Create a team</Heading>
			<BodyLong>You can create a new team and invite others to join.</BodyLong>
			<Button as="a" size="small" href="/team/create" variant="primary" icon={PlusIcon}>
				Create new team
			</Button>
		</div>
	</div>
</Card>

<style>
	.split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		padding-top: 2rem;
	}

	.join {
		display: grid;
		gap: 1rem;
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
