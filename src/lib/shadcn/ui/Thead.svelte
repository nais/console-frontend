<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableSectionElement> {
		children: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, ...rest }: Props = $props();
</script>

<thead class={['sh-thead', className]} {...rest}>
	{@render children()}
</thead>

<style>
	.sh-thead {
		border-bottom: 1px solid var(--border);
		background-color: color-mix(in srgb, var(--secondary) 55%, var(--card));
	}
</style>
