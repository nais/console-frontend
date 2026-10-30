<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: 'button' | 'a';
		href?: string;
		children: Snippet;
		[key: string]: unknown;
	}

	let { as = 'button', href, class: className = '', children, ...rest }: Props = $props();
</script>

{#if as === 'a' || href}
	<a {href} class={['sh-internal-header-btn', className]} {...rest}>
		{@render children()}
	</a>
{:else}
	<button type="button" class={['sh-internal-header-btn', className]} {...rest}>
		{@render children()}
	</button>
{/if}

<style>
	.sh-internal-header-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.625rem;
		border: 1px solid transparent;
		border-radius: calc(var(--radius) - 2px);
		background: transparent;
		color: var(--foreground);
		font-family: inherit;
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		cursor: pointer;
	}
	.sh-internal-header-btn:hover {
		background-color: var(--secondary);
	}
</style>
