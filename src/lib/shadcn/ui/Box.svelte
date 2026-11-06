<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	const radii = {
		'0': '0',
		'2': 'var(--ax-space-2)',
		'4': 'var(--ax-radius-4)',
		'8': 'var(--ax-radius-8)',
		'12': 'var(--ax-radius-12)',
		full: 'var(--ax-radius-full)'
	};
	const borderColors = {
		neutral: 'var(--ax-border-neutral)',
		'neutral-subtle': 'var(--ax-border-neutral-subtle)',
		'neutral-subtleA': 'var(--ax-border-neutral-subtleA)',
		accent: 'var(--primary)',
		danger: 'var(--destructive)'
	};
	const borderWidths = {
		'0': '0',
		'1': 'var(--sh-border-width)',
		'2': 'var(--ax-space-2)',
		'4': 'var(--ax-space-4)'
	};
	const backgrounds = {
		default: 'var(--ax-bg-default)',
		'neutral-soft': 'var(--ax-bg-neutral-soft)',
		'neutral-moderate': 'var(--ax-bg-neutral-moderate)',
		'neutral-strong': 'var(--ax-bg-neutral-strong)'
	};
	const shadows = {
		none: 'none',
		xsmall: 'var(--sh-shadow-xs)',
		small: 'var(--sh-shadow-sm)',
		medium: 'var(--sh-shadow-md)',
		large: 'var(--sh-shadow-lg)'
	};
	type Padding =
		`space-${0 | 1 | 2 | 4 | 6 | 8 | 10 | 12 | 14 | 16 | 18 | 20 | 24 | 28 | 32 | 36 | 40 | 48 | 56 | 64}`;

	interface Props extends HTMLAttributes<HTMLElement> {
		as?: string;
		padding?: Padding;
		borderRadius?: keyof typeof radii;
		borderColor?: keyof typeof borderColors;
		borderWidth?: keyof typeof borderWidths;
		background?: keyof typeof backgrounds;
		shadow?: keyof typeof shadows;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		as = 'div',
		padding,
		borderRadius,
		borderColor,
		borderWidth,
		background,
		shadow,
		class: className = '',
		children,
		...rest
	}: Props = $props();
</script>

<svelte:element
	this={as}
	class={['sh-box', className]}
	{...rest}
	style:padding={padding === 'space-0' ? '0' : padding ? `var(--ax-${padding})` : undefined}
	style:border-radius={borderRadius ? radii[borderRadius] : undefined}
	style:border-color={borderColor ? borderColors[borderColor] : undefined}
	style:border-width={borderWidth ? borderWidths[borderWidth] : undefined}
	style:background-color={background ? backgrounds[background] : undefined}
	style:box-shadow={shadow ? shadows[shadow] : undefined}
>
	{@render children()}
</svelte:element>

<style>
	.sh-box {
		padding: var(--ax-space-16);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--card);
		color: var(--card-foreground);
	}
</style>
