<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTdAttributes } from 'svelte/elements';

	interface Props extends HTMLTdAttributes {
		align?: 'left' | 'center' | 'right';
		children?: Snippet;
		[key: string]: unknown;
	}

	let { align = 'left', class: className = '', children, ...rest }: Props = $props();
</script>

<td class={['sh-td', `align-${align}`, className]} {...rest}>
	{@render children?.()}
</td>

<style>
	.sh-td {
		padding: var(--ax-space-10) var(--ax-space-14);
		vertical-align: middle;
	}
	:global(.sh-table--small) .sh-td {
		padding: var(--ax-space-8) var(--ax-space-12);
	}
	.sh-td.align-center {
		text-align: center;
	}
	.sh-td.align-right {
		text-align: right;
	}
</style>
