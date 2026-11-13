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
		font-size: var(--sh-font-size-base);
	}
	.sh-body-short--medium {
		font-size: var(--sh-font-size-sm);
	}
	.sh-body-short--small {
		font-size: var(--sh-font-size-sm);
	}
	.sh-body-short--spacing {
		margin-bottom: var(--nais-space-12);
	}
	.sh-body-short--semibold {
		font-weight: var(--sh-font-weight-semibold);
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
