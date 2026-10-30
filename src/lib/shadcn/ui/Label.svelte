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
		gap: 0.25rem;
		font-weight: 500;
		color: var(--foreground);
		line-height: 1.35;
	}
	.sh-label--medium {
		font-size: 0.875rem;
	}
	.sh-label--small {
		font-size: 0.8125rem;
	}
	.sh-label--spacing {
		margin-bottom: 0.35rem;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
