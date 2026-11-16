<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
		selected?: boolean;
		shadeOnHover?: boolean;
		children: Snippet;
		onRowClick?: (event: MouseEvent & { currentTarget: EventTarget & HTMLTableRowElement }) => void;
		[key: string]: unknown;
	}

	let {
		selected = false,
		shadeOnHover = true,
		class: className = '',
		children,
		...rest
	}: TrProps = $props();
</script>

<tr
	class={[
		'sh-tr',
		{
			'sh-tr--selected': selected,
			'sh-tr--hover': shadeOnHover
		},
		className
	]}
	{...rest}
>
	{@render children()}
</tr>

<style>
	.sh-tr {
		border-bottom: var(--sh-border-width) solid var(--border);
		transition: background-color 110ms ease;
	}
	:global(.sh-tbody) .sh-tr:last-child {
		border-bottom: none;
	}
	:global(.sh-tbody) .sh-tr--hover:hover {
		background-color: color-mix(in srgb, var(--secondary) 55%, transparent);
	}
	:global(.sh-table--zebra .sh-tbody)
		.sh-tr:nth-child(even):not(.sh-tr--selected):not(.sh-tr--hover:hover) {
		background-color: var(--background-subtle);
	}
	.sh-tr--selected {
		background-color: var(--accent);
	}
</style>
