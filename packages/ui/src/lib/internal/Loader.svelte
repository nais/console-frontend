<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { LoaderCircle } from '@lucide/svelte';

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

	const sizeTokens: Record<NonNullable<Props['size']>, string> = {
		'3xlarge': 'var(--nais-space-48)',
		'2xlarge': 'var(--nais-space-36)',
		xlarge: 'var(--nais-space-28)',
		large: 'var(--nais-space-24)',
		medium: 'var(--nais-space-18)',
		small: 'var(--nais-space-16)',
		xsmall: 'var(--nais-space-12)'
	};

	let dim = $derived(sizeTokens[size] ?? sizeTokens.medium);
</script>

<LoaderCircle
	class={['sh-loader', className]}
	style={`width: ${dim}; height: ${dim}; ${style ?? ''}`}
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
