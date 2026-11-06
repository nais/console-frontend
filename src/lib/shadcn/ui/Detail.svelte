<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: string;
		uppercase?: boolean;
		spacing?: boolean;
		weight?: 'regular' | 'semibold';
		textColor?: string;
		children?: Snippet;
		[key: string]: unknown;
	}

	let {
		as = 'p',
		uppercase = false,
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
		'sh-detail',
		{
			'sh-detail--uppercase': uppercase,
			'sh-detail--spacing': spacing,
			'sh-detail--semibold': weight === 'semibold',
			'sh-detail--subtle': textColor === 'subtle'
		},
		className
	]}
	{...rest}
>
	{@render children?.()}
</svelte:element>

<style>
	.sh-detail {
		margin: 0;
		font-size: var(--sh-font-size-xs);
		line-height: 1.35;
		color: var(--muted-foreground);
	}
	.sh-detail--uppercase {
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.sh-detail--spacing {
		margin-bottom: var(--ax-space-6);
	}
	.sh-detail--semibold {
		font-weight: var(--sh-font-weight-semibold);
	}
	.sh-detail--subtle {
		color: var(--muted-foreground);
	}
</style>
