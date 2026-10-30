<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends SVGAttributes<SVGElement> {
		size?: '3xlarge' | '2xlarge' | 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';
		variant?: 'neutral' | 'interaction' | 'inverted';
		title?: string;
		transparent?: boolean;
		[key: string]: unknown;
	}

	let { size = 'medium', title = 'Loading...', class: className = '', ...rest }: Props = $props();

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

<svg
	class={['sh-loader', className]}
	width={dim}
	height={dim}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2.25"
	stroke-linecap="round"
	stroke-linejoin="round"
	role="status"
	{...rest}
>
	{#if title}
		<title>{title}</title>
	{/if}
	<path d="M21 12a9 9 0 1 1-6.219-8.56" />
</svg>

<style>
	.sh-loader {
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
