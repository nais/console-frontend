<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: string;
		padding?: string;
		borderRadius?: string;
		borderColor?: string;
		borderWidth?: string;
		background?: string;
		shadow?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { as = 'div', class: className = '', children, ...rest }: Props = $props();
</script>

<svelte:element this={as} class={['sh-box', className]} {...rest}>
	{@render children()}
</svelte:element>

<style>
	.sh-box {
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: var(--radius);
		background-color: var(--card);
		color: var(--card-foreground);
	}
</style>
