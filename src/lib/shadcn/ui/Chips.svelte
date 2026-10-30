<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		size?: 'medium' | 'small';
		children: Snippet;
		[key: string]: unknown;
	}

	let { size = 'medium', class: className = '', children, ...rest }: Props = $props();
</script>

<ul class={['sh-chips', `size-${size}`, className]} {...rest}>
	{@render children()}
</ul>

<style>
	.sh-chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.375rem;
		list-style: none;
		margin: 0;
		padding: 0;
	}
</style>
