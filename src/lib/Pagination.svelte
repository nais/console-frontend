<script lang="ts">
	import { BodyShort, Button } from '@nais/ds-svelte-community';
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
	}

	let { page, loaders }: Props = $props();
</script>

{#if page && (page.hasPreviousPage || page.hasNextPage)}
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
	.pagination {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--a-spacing-4);
		color: var(--a-text-subtle);
		padding: var(--a-spacing-4);

		.active-range {
			font-weight: bold;
		}

		.pagination-buttons {
			display: flex;
			gap: var(--a-spacing-1);
		}
	}
</style>
