<script lang="ts">
	import { ExclamationmarkTriangleIcon } from '#lib/icons/index.js';

	let { label }: { label: string } = $props();
</script>

<span class="error-indicator" role="img" aria-label={label} title={label}>
	<ExclamationmarkTriangleIcon
		aria-hidden="true"
		style="width: var(--ax-space-16); height: var(--ax-space-16)"
	/>
</span>

<style>
	.error-indicator {
		display: inline-flex;
		align-items: center;
		color: var(--ax-text-danger);
		animation: error-pulse 2s ease-in-out infinite;
	}

	@keyframes error-pulse {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.15);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.error-indicator {
			animation: none;
		}
	}
</style>
