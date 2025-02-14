<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<circle r="5" fill="var(--a-green-300)" class="pulse" />
	<circle cx="12" cy="12" r="5" fill="var(--a-green-400)" />
</svg>

<style>
	@keyframes pulse {
		0% {
			transform: translate(12px, 12px) scale(1);
			opacity: 1;
		}
		50% {
			transform: translate(12px, 12px) scale(1);
			opacity: 1;
		}
		100% {
			transform: translate(12px, 12px) scale(2);
			opacity: 0;
		}
	}

	.pulse {
		animation: pulse 2s infinite ease-out;
	}
</style>
