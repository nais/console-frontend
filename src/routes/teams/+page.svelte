<script lang="ts">
	import { LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@nais/ds-svelte';
	import type { PageData } from './$houdini';
	import Pagination from '$lib/Pagination.svelte';

	export let data: PageData;
	$: ({ Teams } = data);
</script>

<svelte:head><title>Teams - Console</title></svelte:head>

{#if $Teams.data}
	<div>
		{#each $Teams.data.teams.edges as edge}
			<LinkPanel about={edge.node.description} href="/team/{edge.node.name}" border={true} as="a">
				<LinkPanelTitle>{edge.node.name}</LinkPanelTitle>
				<LinkPanelDescription
					>{edge.node.description ? edge.node.description : 'no description'}</LinkPanelDescription
				>
			</LinkPanel>
		{/each}
	</div>
	<Pagination
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
	/>
{/if}

<style>
	div {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
