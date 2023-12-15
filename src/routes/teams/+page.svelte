<script lang="ts">
	import { LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Teams } = data);
</script>

<svelte:head><title>Teams - Console</title></svelte:head>

{#if $Teams.data}
	<div>
		{#each $Teams.data.teams.nodes as node}
			<LinkPanel about={node.purpose} href="/team/{node.slug}" border={true} as="a">
				<LinkPanelTitle>{node.slug}</LinkPanelTitle>
				<LinkPanelDescription>
					{node.purpose ? node.purpose : 'no description'}
				</LinkPanelDescription>
			</LinkPanel>
		{/each}
	</div>
	<!-- <Pagination
		pageInfo={$Teams.data.teams.pageInfo}
		totalCount={$Teams.data.teams.totalCount}
		on:nextPage={() => {
			if (!$Teams.pageInfo.hasNextPage) return;
			Teams.loadNextPage();
		}}
		on:previousPage={() => {
			if (!$Teams.pageInfo.hasPreviousPage) return;
			Teams.loadPreviousPage();
		}}
	/> -->
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
