<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export interface HeadingProps extends HTMLAttributes<HTMLElement> {
		as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'div';
		level?: '1' | '2' | '3' | '4' | '5' | '6';
		size?: 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';
		spacing?: boolean;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		as,
		level = '1',
		size = 'large',
		spacing = false,
		class: className = '',
		children,
		...rest
	}: HeadingProps = $props();

	let tag = $derived(as ?? (`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'));
</script>

<svelte:element
	this={tag}
	class={['sh-heading', `sh-heading--${size}`, { 'sh-heading--spacing': spacing }, className]}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	.sh-heading {
		margin: 0;
		color: var(--foreground);
		font-weight: var(--sh-font-weight-semibold);
		letter-spacing: -0.02em;
	}
	.sh-heading--xlarge {
		font-size: var(--sh-font-size-title);
		line-height: 1.2;
		font-weight: var(--sh-font-weight-bold);
	}
	.sh-heading--large {
		font-size: var(--sh-font-size-xl);
		line-height: 1.25;
		font-weight: var(--sh-font-weight-heading-large);
	}
	.sh-heading--medium {
		font-size: var(--sh-font-size-lg);
		line-height: 1.35;
	}
	.sh-heading--small {
		font-size: var(--sh-font-size-base);
		line-height: 1.4;
	}
	.sh-heading--xsmall {
		font-size: var(--sh-font-size-body);
		line-height: 1.4;
	}
	.sh-heading--spacing {
		margin-bottom: var(--sh-heading-spacing);
	}
</style>
