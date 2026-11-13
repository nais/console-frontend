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
		gap: var(--nais-space-6);
		padding: var(--nais-space-6) var(--nais-space-10);
		border: var(--sh-border-width) solid transparent;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--foreground);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		font-weight: var(--sh-font-weight-medium);
		text-decoration: none;
		cursor: pointer;
	}
	.sh-internal-header-btn:hover {
		background-color: var(--secondary);
	}
</style>
