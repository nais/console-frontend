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
		padding: 0.625rem 0.875rem;
		vertical-align: middle;
	}
	:global(.sh-table--small) .sh-td {
		padding: 0.5rem 0.75rem;
	}
	.sh-td.align-center {
		text-align: center;
	}
	.sh-td.align-right {
		text-align: right;
	}
</style>
