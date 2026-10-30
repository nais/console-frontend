<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface TableSortState {
		orderBy: string;
		direction: 'ascending' | 'descending';
	}

	export interface TableContext {
		size: 'medium' | 'small';
		zebraStripes: boolean;
		sort?: TableSortState;
		changeSort?: (sortKey: string) => void;
	}

	const contextKey = Symbol('TableContext');

	export function GetTableContext(): TableContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<TableContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, type Snippet } from 'svelte';
	import type { HTMLTableAttributes } from 'svelte/elements';

	interface Props extends HTMLTableAttributes {
		size?: 'medium' | 'small';
		zebraStripes?: boolean;
		stickyHeader?: boolean;
		sort?: TableSortState;
		children: Snippet;
		onsortchange?: (sortKey: string) => void;
		[key: string]: unknown;
	}

	let {
		size = 'medium',
		zebraStripes = false,
		stickyHeader = false,
		sort,
		children,
		onsortchange,
		class: className = '',
		...rest
	}: Props = $props();

	const ctx: TableContext = {
		get size() {
			return size;
		},
		get zebraStripes() {
			return zebraStripes;
		},
		get sort() {
			return sort;
		},
		get changeSort() {
			return onsortchange;
		}
	};

	setContext(contextKey, ctx);
</script>

<table
	class={[
		'sh-table',
		`sh-table--${size}`,
		{
			'sh-table--zebra': zebraStripes,
			'sh-table--sticky': stickyHeader
		},
		className
	]}
	{...rest}
>
	{@render children()}
</table>

<style>
	.sh-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.84375rem;
		color: var(--foreground);
	}
	.sh-table--small {
		font-size: 0.8125rem;
	}
</style>
