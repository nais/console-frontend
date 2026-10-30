<script lang="ts">
	interface Props {
		width?: string;
		height?: string;
		class?: string;
	}

	let { width = '100%', height = '1rem', class: className = '' }: Props = $props();
</script>

<span class="sh-skeleton {className}" style:width style:height aria-hidden="true"></span>

<style>
	.sh-skeleton {
		display: inline-block;
		border-radius: calc(var(--radius) - 4px);
		background-color: var(--muted);
		animation: sh-pulse 1.5s ease-in-out infinite;
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
