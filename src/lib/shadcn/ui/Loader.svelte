<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { LoaderCircle } from '#lib/icons/index.js';

	interface Props extends SVGAttributes<SVGElement> {
		size?: '3xlarge' | '2xlarge' | 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';
		variant?: 'neutral' | 'interaction' | 'inverted';
		title?: string;
		transparent?: boolean;
		[key: string]: unknown;
	}

	let {
		size = 'medium',
		title = 'Loading...',
		color,
		style,
		class: className = '',
		...rest
	}: Props = $props();

	const sizePx: Record<string, number> = {
		'3xlarge': 48,
		'2xlarge': 36,
		xlarge: 28,
		large: 24,
		medium: 18,
		small: 15,
		xsmall: 12
	};

	let dim = $derived(sizePx[size] ?? 18);
</script>

<LoaderCircle
	class={['sh-loader', className]}
	width={dim}
	height={dim}
	style={`width: ${dim}px; height: ${dim}px; ${style ?? ''}`}
	strokeWidth={2.25}
	role="status"
	aria-label={title}
	aria-hidden={false}
	color={color ?? undefined}
	{...rest}
/>

<style>
	:global(.sh-loader) {
		display: inline-block;
		animation: sh-loader-spin 0.75s linear infinite;
		flex-shrink: 0;
		vertical-align: middle;
	}

	@keyframes sh-loader-spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}
</style>
