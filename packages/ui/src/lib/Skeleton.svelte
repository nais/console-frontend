<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	export interface SkeletonProps extends HTMLAttributes<HTMLSpanElement> {
		width?: string;
		height?: string;
		variant?: 'rectangle' | 'circle' | 'text';
	}

	let {
		width = '100%',
		height = 'var(--nais-space-16)',
		variant = 'rectangle',
		class: className = '',
		style,
		...rest
	}: SkeletonProps = $props();
</script>

<span
	class={['sh-skeleton', `sh-skeleton--${variant}`, className]}
	style={[`width: ${width}; height: ${height}`, style].filter(Boolean).join(';')}
	{...rest}
	aria-hidden="true"
></span>

<style>
	.sh-skeleton {
		display: inline-block;
		border-radius: var(--radius-2xs);
		background-color: var(--muted);
		animation: sh-pulse 1.5s ease-in-out infinite;
	}
	.sh-skeleton--circle {
		border-radius: var(--radius-full);
	}
	.sh-skeleton--text {
		vertical-align: middle;
	}

	@media (prefers-reduced-motion: reduce) {
		.sh-skeleton {
			animation: none;
		}
	}

	@keyframes sh-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.45;
		}
	}
</style>
