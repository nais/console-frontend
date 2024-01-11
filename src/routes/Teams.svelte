<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import {
		Alert,
		LinkPanel,
		LinkPanelDescription,
		LinkPanelTitle,
		Skeleton
	} from '@nais/ds-svelte-community';
	import { PersonGroupIcon } from '@nais/ds-svelte-community/icons';
	import type { UserTeamsVariables } from './$houdini';

	const changePage = (page: number) => {
		offset = (page - 1) * limit;
		store.fetch({ variables: { offset } });
	};

	const limit = 3;
	let offset = 0;
	export const _UserTeamsVariables: UserTeamsVariables = () => {
		return { limit, offset };
	};

	const store = graphql(`
		query UserTeams($limit: Int, $offset: Int) @load {
			me @loading {
				__typename
				... on User {
					teams(limit: $limit, offset: $offset) {
						pageInfo {
							totalCount
							hasNextPage
							hasPreviousPage
						}
						nodes {
							team {
								slug
								purpose
							}
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
{/if}

<style>
	h2 {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.teams {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}
</style>
