<svg
	style="width: var(--nais-space-12); height: var(--nais-space-12)"
	viewBox="0 0 12 12"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	overflow="visible"
>
	<circle r="5" fill="var(--destructive)" class="pulse" />
	<circle cx="6" cy="6" r="5" fill="var(--destructive)" />
</svg>

<style>
	@keyframes pulse {
		0% {
			transform: translate(6px, 6px) scale(1);
			opacity: 1;
		}
		50% {
			transform: translate(6px, 6px) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(6px, 6px) scale(2);
			opacity: 0;
		}
	}

	.pulse {
		animation: pulse 2s infinite ease-out;
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
			display: none;
		}
	}
</style>
