<script lang="ts">
	import { BodyShort, Button, Skeleton } from '@nais/ds-svelte-community';
	import { ChevronLeftIcon, ChevronRightIcon } from '@nais/ds-svelte-community/icons';

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
	<div class="pagination">
		<div class="fetching">
			<Skeleton variant="text" style="width: 12ch; height: 1.5rem;" />
		</div>

		<span class="pagination-buttons">
			<Button size="small" variant="tertiary-neutral" icon={ChevronLeftIcon} disabled={true} />
			<Button size="small" variant="tertiary-neutral" icon={ChevronRightIcon} disabled={true} />
		</span>
	</div>
{:else if page && (page.hasPreviousPage || page.hasNextPage)}
	<div class="pagination">
		<BodyShort size="small">
			<span class="active-range">
				{#if page.pageStart !== page.pageEnd}
					{page.pageStart}-{page.pageEnd}
				{:else}
					{page.pageStart}
				{/if}
			</span>

			of {page.totalCount}
		</BodyShort>

		<span class="pagination-buttons">
			<Button
				size="small"
				variant="tertiary-neutral"
				icon={ChevronLeftIcon}
				disabled={!page.hasPreviousPage}
				onclick={() => loaders.loadPreviousPage()}
			/>
			<Button
				size="small"
				variant="tertiary-neutral"
				icon={ChevronRightIcon}
				disabled={!page.hasNextPage}
				onclick={() => loaders.loadNextPage()}
			/>
		</span>
	</div>
{/if}

<style>
	.fetching {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: var(--ax-text-subtle, --a-text-subtle);
		font-size: 1rem;
	}
	.pagination {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--ax-space-16, --a-spacing-4);
		color: var(--ax-text-subtle, --a-text-subtle);
		padding: var(--ax-space-16, --a-spacing-4);

		.active-range {
			font-weight: bold;
		}

		.pagination-buttons {
			display: flex;
			gap: var(--ax-space-4, --a-spacing-1);
		}
	}
</style>
