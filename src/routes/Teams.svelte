<script lang="ts">
	import { graphql } from '$houdini';
	import {
		Alert,
		Button,
		LinkPanel,
		LinkPanelDescription,
		LinkPanelTitle
	} from '@nais/ds-svelte-community';
	import { PersonGroupIcon, PlusIcon } from '@nais/ds-svelte-community/icons';

	const store = graphql(`
		query UserTeams123 @load {
			me {
				__typename
				... on User {
					teams(first: 2) @paginate {
						pageInfo {
							totalCount
							hasNextPage
							startCursor
							endCursor
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
	<div class="header">
		<h2>
			<PersonGroupIcon />
			My teams
		</h2>
		<Button as="a" size="small" href="/team/create" variant="primary"
			><svelte:fragment slot="icon-left"><PlusIcon /></svelte:fragment>Create team</Button
		>
	</div>
	<div class="teams">
		{#if $store.data}
			{#if $store.data.me.__typename == 'User'}
				{#each $store.data.me.teams.nodes as node}
					{@const team = node.team}
					<LinkPanel about={team.purpose} href="/team/{team.slug}" border={true} as="a">
						<LinkPanelTitle>{team.slug}</LinkPanelTitle>
						<LinkPanelDescription>{team.purpose}</LinkPanelDescription>
					</LinkPanel>
				{:else}
					<p>You are not a member of any teams.</p>
				{/each}
				<code>
					{JSON.stringify($store.data.me.teams.pageInfo)}
				</code>
				<button on:click={async () => await store.loadNextPage()}> load more </button>

				<button on:click={async () => await store.loadPreviousPage()}> load less </button>
			{/if}
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
