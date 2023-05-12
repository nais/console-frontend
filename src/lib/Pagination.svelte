<script lang="ts">
	import { ChevronRight, ChevronLeft } from '@nais/ds-svelte/icons';
	import { Button } from '@nais/ds-svelte';
	export let nextPage: Function;
	export let previousPage: Function;
	export let totalCount: number;
	export let pageInfo: {
		readonly hasNextPage: boolean;
		readonly hasPreviousPage: boolean;
		readonly startCursor: any;
		readonly endCursor: any;
		readonly from: number;
		readonly to: number;
	};
</script>

{#if !pageInfo.hasNextPage && !pageInfo.hasPreviousPage}
	<div />
{:else}
	<div>
		<Button
			size="xsmall"
			on:click={() => {
				if (!pageInfo.hasPreviousPage) return;
				previousPage();
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
				nextPage();
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
