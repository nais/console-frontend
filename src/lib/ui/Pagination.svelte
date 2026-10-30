<script lang="ts">
	import { ShButton, ShSkeleton } from '#lib/shadcn/ui/index.js';

	import { ChevronLeftIcon, ChevronRightIcon } from '#lib/icons/index.js';

	interface Props {
		page:
			| {
					readonly hasNextPage: boolean;
					readonly hasPreviousPage: boolean;
					readonly pageStart: number;
					readonly pageEnd: number;
					readonly totalCount: number;
			  }
			| undefined;
		loaders: {
			loadNextPage: () => unknown;
			loadPreviousPage: () => unknown;
		};
		fetching?: boolean;
	}

	let { page, loaders, fetching }: Props = $props();
</script>

{#if fetching}
	<div class="pagination" aria-busy="true" aria-label="Loading page">
		<div class="fetching">
			<ShSkeleton width="12ch" height="1.25rem" />
		</div>

		<span class="pagination-buttons">
			<ShButton size="icon-sm" variant="outline" disabled={true} ariaLabel="Previous page">
				<ChevronLeftIcon aria-hidden="true" />
			</ShButton>
			<ShButton size="icon-sm" variant="outline" disabled={true} ariaLabel="Next page">
				<ChevronRightIcon aria-hidden="true" />
			</ShButton>
		</span>
	</div>
{:else if page && (page.hasPreviousPage || page.hasNextPage)}
	<div class="pagination">
		<span>
			<span class="active-range">
				{#if page.pageStart !== page.pageEnd}
					{page.pageStart}–{page.pageEnd}
				{:else}
					{page.pageStart}
				{/if}
			</span>
			of {page.totalCount}
		</span>

		<span class="pagination-buttons">
			<ShButton
				size="icon-sm"
				variant="outline"
				disabled={!page.hasPreviousPage}
				onclick={() => loaders.loadPreviousPage()}
				ariaLabel="Previous page"
			>
				<ChevronLeftIcon aria-hidden="true" />
			</ShButton>
			<ShButton
				size="icon-sm"
				variant="outline"
				disabled={!page.hasNextPage}
				onclick={() => loaders.loadNextPage()}
				ariaLabel="Next page"
			>
				<ChevronRightIcon aria-hidden="true" />
			</ShButton>
		</span>
	</div>
{/if}

<style>
	.fetching {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--muted-foreground);
		font-size: 0.875rem;
	}
	.pagination {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 0.875rem;
		color: var(--muted-foreground);
		padding: 0.75rem 1rem;
		font-size: 0.8125rem;
		font-variant-numeric: tabular-nums;

		.active-range {
			font-weight: 600;
			color: var(--foreground);
		}

		.pagination-buttons {
			display: flex;
			gap: 0.25rem;
		}
	}
</style>
