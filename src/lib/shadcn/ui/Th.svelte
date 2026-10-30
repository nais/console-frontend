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
		padding: 0.625rem 0.875rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted-foreground);
		text-align: left;
		vertical-align: middle;
	}
	:global(.sh-table--small) .sh-th {
		padding: 0.5rem 0.75rem;
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
		gap: 0.35rem;
		padding: 0.15rem 0.35rem;
		margin: -0.15rem -0.35rem;
		border: none;
		border-radius: calc(var(--radius) - 4px);
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
