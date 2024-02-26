<script lang="ts">
	import { PendingValue } from '$houdini';
	import { Pagination } from '@nais/ds-svelte-community';
	export let limit: number;
	export let offset: number;
	export let changePage: (page: number) => void;

	export let pageInfo:
		| {
				readonly totalCount: number | typeof PendingValue;
		  }
		| undefined;

	function count(totalCount: number) {
		return Math.ceil(totalCount / limit);
	}
	function page(offset: number, limit: number) {
		return Math.ceil(offset / limit) + 1;
	}
</script>

{#if !pageInfo || pageInfo.totalCount == PendingValue}
	<!-- nothing -->
{:else if pageInfo.totalCount <= limit}
	<!-- nothing -->
{:else}
	<Pagination
		count={count(pageInfo.totalCount)}
		page={page(offset, limit)}
		size="small"
		on:change={(e) => changePage(e.detail.page)}
	/>
{/if}
