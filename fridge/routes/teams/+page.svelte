<script lang="ts">
	import Pagination from '$lib/Pagination.svelte';
	import { changeParams, limitOffset } from '$lib/pagination';
	import { LinkPanel, LinkPanelDescription, LinkPanelTitle } from '@nais/ds-svelte-community';
	import type { PageData } from './$houdini';

	export let data: PageData;
	$: ({ Teams } = data);
	$: ({ limit, offset } = limitOffset($Teams.variables));
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

	<Pagination
		pageInfo={$Teams.data?.teams?.pageInfo}
		{limit}
		{offset}
		changePage={(page) => {
			changeParams({ page: page.toString() });
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
