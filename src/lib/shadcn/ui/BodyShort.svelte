<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: string;
		size?: 'large' | 'medium' | 'small';
		spacing?: boolean;
		weight?: 'regular' | 'semibold';
		truncate?: boolean;
		textColor?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		as = 'p',
		size = 'medium',
		spacing = false,
		weight = 'regular',
		truncate = false,
		textColor,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={[
		'sh-body-short',
		`sh-body-short--${size}`,
		{
			'sh-body-short--spacing': spacing,
			'sh-body-short--semibold': weight === 'semibold',
			'sh-body-short--truncate': truncate,
			'sh-body-short--subtle': textColor === 'subtle'
		},
		className
	]}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	.sh-body-short {
		margin: 0;
		color: inherit;
		line-height: 1.45;
	}
	.sh-body-short--large {
		font-size: 1rem;
	}
	.sh-body-short--medium {
		font-size: 0.875rem;
	}
	.sh-body-short--small {
		font-size: 0.8125rem;
	}
	.sh-body-short--spacing {
		margin-bottom: 0.75rem;
	}
	.sh-body-short--semibold {
		font-weight: 600;
	}
	.sh-body-short--truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.sh-body-short--subtle {
		color: var(--muted-foreground);
	}
</style>
