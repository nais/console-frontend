<script lang="ts">
	import { Button } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';

	export let page:
		| {
				readonly hasNextPage: boolean;
				readonly hasPreviousPage: boolean;
				readonly pageStart: number;
				readonly pageEnd: number;
				readonly totalCount: number;
		  }
		| undefined;

	export let loaders: {
		loadNextPage: () => Promise<void>;
		loadPreviousPage: () => Promise<void>;
	};
</script>

{#if page && (page.hasPreviousPage || page.hasNextPage)}
	<div class="pagination">
		<span>
			{#if page.pageStart !== page.pageEnd}
				{page.pageStart} - {page.pageEnd}
			{:else}
				{page.pageStart}
			{/if}

			of {page.totalCount}
		</span>

		<span style="padding-left: 1rem;">
			<Button
				size="small"
				variant="secondary"
				disabled={!page.hasPreviousPage}
				on:click={() => loaders.loadPreviousPage()}
			>
				<ChevronLeftIcon />
			</Button>
			<Button
				size="small"
				variant="secondary"
				disabled={!page.hasNextPage}
				on:click={() => loaders.loadNextPage()}
			>
				<ChevronRightIcon />
			</Button>
		</span>
	</div>
{/if}

<style>
	.pagination {
		text-align: right;
		padding: 0.5rem;
	}
</style>
