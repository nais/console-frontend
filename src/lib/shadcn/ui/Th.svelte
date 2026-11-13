<script lang="ts">
	import { ArrowDownIcon, ArrowsUpDownIcon, ArrowUpIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLThAttributes } from 'svelte/elements';
	import { GetTableContext } from './Table.svelte';

	interface Props extends HTMLThAttributes {
		align?: 'left' | 'center' | 'right';
		sortKey?: string;
		sortable?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		align = 'left',
		sortKey = '',
		sortable = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const ctx = GetTableContext();
</script>

<th
	class={['sh-th', `align-${align}`, className]}
	aria-sort={sortable ? (ctx?.sort?.orderBy === sortKey ? ctx.sort.direction : 'none') : undefined}
	{...rest}
>
	{#if sortable}
		<button
			type="button"
			class="sh-th__sort-btn"
			onclick={() => {
				if (sortable && sortKey && ctx?.changeSort) {
					ctx.changeSort(sortKey);
				}
			}}
		>
			<span>{@render children?.()}</span>
			{#if ctx?.sort?.orderBy === sortKey}
				{#if ctx.sort.direction === 'ascending'}
					<ArrowUpIcon aria-hidden="true" />
				{:else}
					<ArrowDownIcon aria-hidden="true" />
				{/if}
			{:else}
				<ArrowsUpDownIcon aria-hidden="true" />
			{/if}
		</button>
	{:else}
		{@render children?.()}
	{/if}
</th>

<style>
	.sh-th {
		padding: var(--nais-space-10) var(--nais-space-14);
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-semibold);
		color: var(--muted-foreground);
		text-align: left;
		vertical-align: middle;
	}
	:global(.sh-table--small) .sh-th {
		padding: var(--nais-space-8) var(--nais-space-12);
	}
	.sh-th.align-center {
		text-align: center;
	}
	.sh-th.align-right {
		text-align: right;
	}
	.sh-th__sort-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--nais-space-6);
		padding: var(--nais-space-2) var(--nais-space-6);
		margin: calc(-1 * var(--nais-space-2)) calc(-1 * var(--nais-space-6));
		border: none;
		border-radius: var(--radius-2xs);
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.sh-th__sort-btn:hover {
		background-color: var(--secondary);
		color: var(--foreground);
	}
</style>
