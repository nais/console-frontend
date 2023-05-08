<script lang="ts">
	import Next from '$lib/icons/Next.svelte';
	import { fragment, graphql } from '$houdini';
	import type { UserTeams } from '$houdini';

	export let user: UserTeams;
	$: data = fragment(
		user,
		graphql(`
			fragment UserTeams on User {
				teams {
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

<div class="container">
	{#each $data.teams.edges as edge}
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
</div>

<style>
	.container {
		display: flex;
		width: 60%;
		justify-content: space-between;
	}
	.team {
		background-color: var(--a-bg-default);
		display: flex;
		justify-content: space-between;
		border-radius: 0.25rem;
		padding: 0 1rem;
		align-items: center;
		gap: 10px 0px;
		border: 1px solid transparent;
		cursor: pointer;
		color: var(--a-text-default);
		text-decoration: none;
		min-width: 200px;
		height: 60px;
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
