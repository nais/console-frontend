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
		font-weight: 600;
		letter-spacing: -0.02em;
	}
	.sh-heading--xlarge {
		font-size: 1.75rem;
		line-height: 1.2;
		font-weight: 700;
	}
	.sh-heading--large {
		font-size: 1.375rem;
		line-height: 1.25;
		font-weight: 650;
	}
	.sh-heading--medium {
		font-size: 1.125rem;
		line-height: 1.35;
	}
	.sh-heading--small {
		font-size: 0.9375rem;
		line-height: 1.4;
	}
	.sh-heading--xsmall {
		font-size: 0.84375rem;
		line-height: 1.4;
	}
	.sh-heading--spacing {
		margin-bottom: 0.5em;
	}
</style>
