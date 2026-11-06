<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: string;
		size?: 'large' | 'medium' | 'small';
		spacing?: boolean;
		weight?: 'regular' | 'semibold';
		textColor?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		as = 'p',
		size = 'medium',
		spacing = false,
		weight = 'regular',
		textColor,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={[
		'sh-body-long',
		`sh-body-long--${size}`,
		{
			'sh-body-long--spacing': spacing,
			'sh-body-long--semibold': weight === 'semibold',
			'sh-body-long--subtle': textColor === 'subtle'
		},
		className
	]}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	.sh-body-long {
		margin: 0;
		color: inherit;
		line-height: 1.6;
	}
	.sh-body-long--large {
		font-size: var(--sh-font-size-base);
	}
	.sh-body-long--medium {
		font-size: var(--sh-font-size-sm);
	}
	.sh-body-long--small {
		font-size: var(--sh-font-size-sm);
	}
	.sh-body-long--spacing {
		margin-bottom: var(--ax-space-14);
	}
	.sh-body-long--semibold {
		font-weight: var(--sh-font-weight-semibold);
	}
	.sh-body-long--subtle {
		color: var(--muted-foreground);
	}
</style>
