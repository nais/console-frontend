<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		size?: 'medium' | 'small';
		heading?: string;
		headingTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		size = 'medium',
		heading = 'You must fix these errors before you can continue',
		headingTag = 'h2',
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<div role="alert" class={['sh-error-summary', `sh-error-summary--${size}`, className]} {...rest}>
	<svelte:element this={headingTag} class="sh-error-summary__heading">{heading}</svelte:element>
	<div class="sh-error-summary__body">
		{@render children()}
	</div>
</div>

<style>
	.sh-error-summary {
		padding: 1rem;
		border-radius: var(--radius);
		border: 1px solid var(--destructive-border);
		background-color: var(--destructive-muted);
		color: var(--destructive);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.sh-error-summary__heading {
		margin: 0;
		font-size: 0.9375rem;
		font-weight: 600;
	}
	.sh-error-summary__body {
		font-size: 0.875rem;
	}
</style>
