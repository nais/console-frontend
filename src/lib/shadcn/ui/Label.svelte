<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	interface Props extends HTMLLabelAttributes {
		as?: string;
		size?: 'medium' | 'small';
		spacing?: boolean;
		visuallyHidden?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		as = 'label',
		size = 'medium',
		spacing = false,
		visuallyHidden = false,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={[
		'sh-label',
		`sh-label--${size}`,
		{
			'sh-label--spacing': spacing,
			'sr-only': visuallyHidden
		},
		className
	]}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	.sh-label {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-4);
		font-weight: var(--sh-font-weight-medium);
		color: var(--foreground);
		line-height: 1.35;
	}
	.sh-label--medium {
		font-size: var(--sh-font-size-sm);
	}
	.sh-label--small {
		font-size: var(--ax-font-size-small);
	}
	.sh-label--spacing {
		margin-bottom: var(--ax-space-6);
	}
	.sr-only {
		position: absolute;
		width: var(--ax-space-1);
		height: var(--ax-space-1);
		padding: 0;
		margin: calc(-1 * var(--ax-space-1));
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
