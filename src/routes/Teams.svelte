<script lang="ts">
	import { PendingValue, graphql } from '$houdini';
	import Card from '$lib/Card.svelte';
	import Pagination from '$lib/Pagination.svelte';
	import {
		Alert,
		Button,
		LinkPanel,
		LinkPanelDescription,
		LinkPanelTitle,
		Skeleton
	} from '@nais/ds-svelte-community';
	import { PersonGroupIcon, PlusIcon } from '@nais/ds-svelte-community/icons';
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
	<Card width="600px">
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
				{#if $store.data.me == PendingValue}
					<LinkPanel about="" href="" border={true} as="a">
						<LinkPanelTitle
							><Skeleton variant="rectangle" width="100px" height="32px" /></LinkPanelTitle
						>
						<LinkPanelDescription
							><Skeleton variant="rectangle" width="450px" /></LinkPanelDescription
						>
					</LinkPanel>
				{:else if $store.data.me.__typename == 'User'}
					{#each $store.data.me.teams.nodes as node}
						{@const team = node.team}
						<LinkPanel about={team.purpose} href="/team/{team.slug}" border={true} as="a">
							<LinkPanelTitle>{team.slug}</LinkPanelTitle>
							<LinkPanelDescription>{team.purpose}</LinkPanelDescription>
						</LinkPanel>
					{/each}
					<Pagination pageInfo={$store.data.me.teams.pageInfo} {limit} {offset} {changePage} />
				{/if}
			{/if}
		</div>
	</Card>
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
