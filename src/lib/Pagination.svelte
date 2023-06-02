<script lang="ts">
	import { ChevronRight, ChevronLeft } from '@nais/ds-svelte/icons';
	import { Button } from '@nais/ds-svelte';
	import { createEventDispatcher } from 'svelte';
	export let totalCount: number;
	export let pageInfo: {
		readonly hasNextPage: boolean;
		readonly hasPreviousPage: boolean;
		readonly from: number;
		readonly to: number;
	};
	const dispatch = createEventDispatcher();
</script>

{#if !pageInfo.hasNextPage && !pageInfo.hasPreviousPage}
	<div />
{:else}
	<div>
		<Button
			size="xsmall"
			on:click={() => {
				if (!pageInfo.hasPreviousPage) return;
				dispatch('previousPage');
			}}
			disabled={!pageInfo.hasPreviousPage}
			><svelte:fragment slot="icon-left"><ChevronLeft aria-label="Previous page" /></svelte:fragment
			></Button
		>
		<span>
			{pageInfo.from} -
			{pageInfo.to} of
			{totalCount}
		</span>
		<Button
			size="xsmall"
			on:click={() => {
				if (!pageInfo.hasNextPage) return;
				dispatch('nextPage');
			}}
			disabled={!pageInfo.hasNextPage}
		>
			<svelte:fragment slot="icon-left"><ChevronRight aria-label="Next page" /></svelte:fragment
			></Button
		>
	</div>
{/if}

<style>
	div {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
		gap: 1rem;
	}
</style>
