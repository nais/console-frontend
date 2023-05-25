<script lang="ts">
	import { graphql, paginatedFragment } from '$houdini';
	import type { UserTeams } from '$houdini';
	import { PersonGroup } from '@nais/ds-svelte/icons';
	import Card from '$lib/Card.svelte';
	import { LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@nais/ds-svelte';

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

<Card minWidth="300px">
	<h3>
		<PersonGroup />
		My teams
	</h3>
	<div class="teams">
		{#each $teams.data.teams.edges as edge}
			<LinkPanel about={edge.node.description} href="/team/{edge.node.name}" border={true} as="a">
				<LinkPanelTitle>{edge.node.name}</LinkPanelTitle>
				<LinkPanelDescription>{edge.node.description}</LinkPanelDescription>
			</LinkPanel>
		{/each}
	</div>
</Card>

<style>
	h3 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.teams {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
