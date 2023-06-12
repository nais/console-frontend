<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Loading from '$lib/Loading.svelte';
	import { Alert, LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@nais/ds-svelte';
	import { PersonGroup } from '@nais/ds-svelte/icons';

	const store = graphql(`
		query UserTeams @load {
			user @loading {
				name
				email @loading
				teams @loading {
					totalCount
					pageInfo {
						hasNextPage
						hasPreviousPage
						startCursor
						endCursor
						from
						to
					}
					edges @loading(count: 10) {
						node {
							name
							description
						}
					}
				}
			}
		}
	`);
</script>

{#if $store.errors}
	{#each $store.errors as error}
		<Alert variant="error">
			{error.message}
		</Alert>
	{/each}
{:else}
	<Card minWidth="300px">
		<h3>
			<PersonGroup />
			My teams
		</h3>
		<div class="teams">
			{#if $store.data}
				{#each $store.data.user.teams.edges as edge}
					{#if edge === PendingValue}
						<LinkPanel about="" href="" border={true} as="a">
							<LinkPanelTitle><Loading width="100px" height="32px" /></LinkPanelTitle>
							<LinkPanelDescription><Loading width="450px" /></LinkPanelDescription>
						</LinkPanel>
					{:else}
						<LinkPanel
							about={edge.node.description}
							href="/team/{edge.node.name}"
							border={true}
							as="a"
						>
							<LinkPanelTitle>{edge.node.name}</LinkPanelTitle>
							<LinkPanelDescription>{edge.node.description}</LinkPanelDescription>
						</LinkPanel>
					{/if}
				{/each}
			{/if}
		</div>
	</Card>
{/if}

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
