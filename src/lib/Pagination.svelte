<script lang="ts">
	import { Pagination } from '@nais/ds-svelte-community';
	export let limit: number;
	export let offset: number;
	export let changePage: (page: number) => void;

	export let pageInfo: {
		readonly totalCount: number;
		readonly hasNextPage: boolean;
		readonly hasPreviousPage: boolean;
	};

	$: count = Math.ceil(pageInfo.totalCount / limit);
	$: page = Math.ceil(offset / limit) + 1;
</script>

{#if !pageInfo.hasNextPage && !pageInfo.hasPreviousPage}
	<div>{pageInfo.hasNextPage} - {pageInfo.hasPreviousPage}</div>
{:else}
	<Pagination {count} {page} size="small" on:change={(e) => changePage(e.detail.page)} />
{/if}
