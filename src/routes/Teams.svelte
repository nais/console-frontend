<script lang="ts">
	import { graphql, paginatedFragment } from '$houdini';
	import { PendingValue } from '$houdini';
	import type { UserTeams } from '$houdini';
	import { PersonGroup } from '@nais/ds-svelte/icons';
	import Card from '$lib/Card.svelte';
	import { LinkPanel, LinkPanelDescription, LinkPanelTitle, Loader } from '@nais/ds-svelte';

	export let user: UserTeams;
	$: teams = paginatedFragment(
		user,
		graphql(`
			fragment UserTeams on User {
				teams @paginate(mode: SinglePage) @loading(count: 3, cascade: true) {
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
			{#if edge.node.name === PendingValue}
				<LinkPanel about="" href="" border={true} as="a">
					<LinkPanelTitle><Loader /></LinkPanelTitle>
					<LinkPanelDescription><Loader /></LinkPanelDescription>
				</LinkPanel>
			{:else}
				<LinkPanel about={edge.node.description} href="/team/{edge.node.name}" border={true} as="a">
					<LinkPanelTitle>{edge.node.name}</LinkPanelTitle>
					<LinkPanelDescription>{edge.node.description}</LinkPanelDescription>
				</LinkPanel>
			{/if}
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
