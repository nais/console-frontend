<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import {
		Alert,
		LinkPanel,
		LinkPanelDescription,
		LinkPanelTitle,
		Skeleton
	} from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';

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
	<Card width="600px">
		<h2>
			<PersonGroupIcon />
			My teams
		</h2>
		<div class="teams">
			{#if $store.data}
				{#each $store.data.user.teams.edges as edge}
					{#if edge === PendingValue}
						<LinkPanel about="" href="" border={true} as="a">
							<LinkPanelTitle
								><Skeleton variant="rectangle" width="100px" height="32px" /></LinkPanelTitle
							>
							<LinkPanelDescription
								><Skeleton variant="rectangle" width="450px" /></LinkPanelDescription
							>
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
	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}
	.teams {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
