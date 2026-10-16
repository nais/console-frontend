<script lang="ts">
	import { Table, Tbody, Thead, Tr, type TableSortState } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	let {
		label,
		sort,
		onsortchange,
		header,
		children
	}: {
		label: string;
		sort?: TableSortState;
		onsortchange?: (key: string) => void;
		header: Snippet;
		children: Snippet;
	} = $props();
</script>

<div class="table-scroll resource-table" role="region" aria-label={label}>
	<Table size="medium" {sort} {onsortchange}>
		<Thead>
			<Tr>{@render header()}</Tr>
		</Thead>
		<Tbody>{@render children()}</Tbody>
	</Table>
</div>

<style>
	.resource-table :global(th.status-column) {
		width: calc(var(--ax-space-64) + var(--ax-space-16));
		min-width: calc(var(--ax-space-64) + var(--ax-space-16));
		max-width: calc(var(--ax-space-64) + var(--ax-space-16));
		box-sizing: border-box;
	}

	.resource-table :global(th.status-column:not([aria-sort])),
	.resource-table :global(th.status-column .aksel-table__sort-button) {
		padding-inline: var(--ax-space-4);
	}

	.resource-table :global(thead th) {
		border-bottom-width: 1px;
		font-size: var(--ax-font-size-small);
		font-weight: 500;
		color: var(--ax-text-neutral-subtle);
	}

	.resource-table :global(thead th:not([aria-sort])),
	.resource-table :global(.aksel-table__sort-button) {
		padding-block: var(--ax-space-8);
	}

	.resource-table :global(.aksel-table__sort-button) {
		font: inherit;
		color: inherit;
	}

	.resource-table :global(.resource-name) {
		color: var(--ax-text-neutral);
		font-weight: var(--ax-font-weight-bold);
		text-decoration: none;
		overflow-wrap: anywhere;
	}

	.resource-table :global(.resource-name:hover) {
		text-decoration: underline;
	}

	.resource-table :global(.status-cell) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-4);
	}

	.resource-table :global(.resource-name-group) {
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
	}

	.resource-table :global(.table-meta) {
		font-size: var(--ax-font-size-small);
		color: var(--ax-text-neutral-subtle);
	}
</style>
