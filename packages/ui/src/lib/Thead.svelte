<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface TheadProps extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, ...rest }: TheadProps = $props();
</script>

<thead class={['sh-thead', className]} {...rest}>
	{@render children()}
</thead>

<style>
	.sh-thead {
		border-bottom: var(--sh-border-width) solid var(--border);
		background-color: color-mix(in srgb, var(--secondary) 55%, var(--card));
	}
	:global(.sh-table--sticky) .sh-thead {
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: var(--card);
	}
</style>
