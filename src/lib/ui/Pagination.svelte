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

	let { page, loaders, fetching = false }: Props = $props();
	const previousDisabled = $derived(fetching || !page?.hasPreviousPage);
	const nextDisabled = $derived(fetching || !page?.hasNextPage);
</script>

{#if fetching || (page && (page.hasPreviousPage || page.hasNextPage))}
	<div class="pagination" aria-busy={fetching} aria-label={fetching ? 'Loading page' : undefined}>
		{#if fetching}
			<div class="fetching">
				<ShSkeleton width="12ch" height="var(--nais-space-20)" />
			</div>
		{:else if page}
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
		{/if}

		<span class="pagination-buttons">
			<ShButton
				size="icon-sm"
				variant="outline"
				aria-disabled={previousDisabled ? 'true' : undefined}
				onclick={() => {
					if (!previousDisabled) loaders.loadPreviousPage();
				}}
				ariaLabel="Previous page"
			>
				<ChevronLeftIcon aria-hidden="true" />
			</ShButton>
			<ShButton
				size="icon-sm"
				variant="outline"
				aria-disabled={nextDisabled ? 'true' : undefined}
				onclick={() => {
					if (!nextDisabled) loaders.loadNextPage();
				}}
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
		font-size: var(--sh-font-size-sm);
	}
	.pagination {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--nais-space-14);
		color: var(--muted-foreground);
		padding: var(--nais-space-12) var(--nais-space-16);
		font-size: var(--sh-font-size-caption);
		font-variant-numeric: tabular-nums;

		.active-range {
			font-weight: 600;
			color: var(--foreground);
		}

		.pagination-buttons {
			display: flex;
			gap: var(--nais-space-4);
		}
	}
</style>
