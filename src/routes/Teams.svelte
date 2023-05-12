<script lang="ts">
	import Next from '$lib/icons/Next.svelte';
	import { graphql, paginatedFragment } from '$houdini';
	import type { UserTeams } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';

	export let user: UserTeams;
	$: teams = paginatedFragment(
		user,
		graphql(`
			fragment UserTeams on User {
				teams @paginate(mode: SinglePage) {
					totalCount
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
						from
						to
					}
					edges {
						node {
							name
							description
						}
					}
				}
			}
		`)
	);
</script>

<Card>
	<h3>My teams</h3>
	{#each $teams.data.teams.edges as edge}
		<a class="team" href="/team/{edge.node.name}">
			<div>
				<h3>{edge.node.name}</h3>
				<p>{edge.node.description}</p>
			</div>
			<div class="next">
				<Next width="2rem" height="2rem" />
			</div>
		</a>
	{/each}
</Card>

<style>
	.teamscontainer {
		display: flex;
		justify-content: flex-start;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.team {
		background-color: var(--a-bg-default);
		display: flex;
		justify-content: space-between;
		border-radius: 0.25rem;
		padding: 0 1rem;
		cursor: pointer;
		color: var(--a-text-default);
		text-decoration: none;
		width: 200px;
		max-width: 384px;
		min-height: 60px;
		text-overflow: clip;
	}
	.team:hover {
		box-shadow: var(--a-shadow-medium);
		border: 1px solid var(--a-border-action);
		color: var(--ac-link-panel-text, var(--a-text-default));
	}
	.team:hover > div > h3 {
		color: var(--a-text-action);
		text-decoration: underline;
	}
	.team:hover > .next {
		transform: translateX(0.5rem);
		transition: transform 200ms;
	}
	h3 {
		margin: 0;
	}
	p {
		margin: 0;
	}
</style>
