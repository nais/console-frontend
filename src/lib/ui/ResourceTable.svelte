<script lang="ts">
	import { Table, Tbody, Thead, Tr, type TableSortState } from '#lib/shadcn/ui/index.js';
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

<!-- svelte-ignore a11y_no_noninteractive_tabindex (Keyboard focus enables native horizontal scrolling.) -->
<div class="table-scroll resource-table" role="region" aria-label={label} tabindex="0">
	<Table size="medium" {sort} {onsortchange}>
		<Thead>
			<Tr>{@render header()}</Tr>
		</Thead>
		<Tbody>{@render children()}</Tbody>
	</Table>
</div>

<style>
	.resource-table:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: -2px;
	}

	.resource-table :global(table) {
		border-collapse: collapse;
	}

	.resource-table :global(th.status-column) {
		width: 4.5rem;
		min-width: 4.5rem;
		max-width: 4.5rem;
		box-sizing: border-box;
	}

	.resource-table :global(th.status-column:not([aria-sort])),
	.resource-table :global(th.status-column .sh-ui-th__sort-btn) {
		padding-inline: 0.5rem;
	}

	.resource-table :global(thead tr) {
		background-color: var(--background-subtle);
		border-bottom: 1px solid var(--border);
	}

	.resource-table :global(thead th) {
		border-bottom: 1px solid var(--border);
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0;
		color: var(--muted-foreground);
	}

	.resource-table :global(thead th:not([aria-sort])),
	.resource-table :global(.sh-ui-th__sort-btn) {
		padding-block: 0.65rem;
	}

	.resource-table :global(.sh-ui-th__sort-btn) {
		font: inherit;
		color: inherit;
	}

	.resource-table :global(tbody tr) {
		border-bottom: 1px solid var(--border);
		transition: background-color 120ms ease;
	}

	.resource-table :global(tbody tr:last-child) {
		border-bottom: none;
	}

	.resource-table :global(tbody tr:hover) {
		background-color: var(--card-hover);
	}

	.resource-table :global(tbody td) {
		padding-block: 0.75rem;
		border-bottom: none;
	}

	.resource-table :global(.resource-name) {
		color: var(--foreground);
		font-weight: 600;
		text-decoration: none;
		overflow-wrap: anywhere;
	}

	.resource-table :global(.resource-name:hover) {
		color: var(--primary);
		text-decoration: underline;
	}

	.resource-table :global(.status-cell) {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.25rem;
	}

	.resource-table :global(.resource-name-group) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.resource-table :global(.table-meta) {
		font-size: 0.8125rem;
		color: var(--muted-foreground);
		font-variant-numeric: tabular-nums;
	}
</style>
