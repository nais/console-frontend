<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	const radii = {
		'0': '0',
		'2': 'var(--nais-space-2)',
		'4': 'var(--nais-radius-4)',
		'8': 'var(--nais-radius-8)',
		'12': 'var(--nais-radius-12)',
		full: 'var(--radius-full)'
	};
	const borderColors = {
		neutral: 'var(--border-strong)',
		'neutral-subtle': 'var(--border)',
		'neutral-subtleA': 'var(--border)',
		accent: 'var(--primary)',
		danger: 'var(--destructive)'
	};
	const borderWidths = {
		'0': '0',
		'1': 'var(--sh-border-width)',
		'2': 'var(--nais-space-2)',
		'4': 'var(--nais-space-4)'
	};
	const backgrounds = {
		default: 'var(--card)',
		'neutral-soft': 'var(--background-subtle)',
		'neutral-moderate': 'var(--secondary)',
		'neutral-strong': 'var(--primary)'
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
	style:padding={padding === 'space-0' ? '0' : padding ? `var(--nais-${padding})` : undefined}
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
		padding: var(--nais-space-16);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--card);
		color: var(--card-foreground);
	}
</style>
