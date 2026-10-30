<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		label?: string;
	}

	let { size = 'md', label = 'Loading…' }: Props = $props();
</script>

<span class="sh-spinner size-{size}" role="status" aria-label={label}>
	<span class="sh-spinner-ring" aria-hidden="true"></span>
</span>

<style>
	.sh-spinner {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.sh-spinner-ring {
		display: inline-block;
		border-radius: 9999px;
		border: 2px solid var(--border);
		border-top-color: var(--muted-foreground);
		animation: sh-spin 650ms linear infinite;
	}

	.size-sm .sh-spinner-ring {
		width: 0.875rem;
		height: 0.875rem;
		border-width: 1.5px;
	}

	.size-md .sh-spinner-ring {
		width: 1.25rem;
		height: 1.25rem;
	}

	.size-lg .sh-spinner-ring {
		width: 1.5rem;
		height: 1.5rem;
	}

	@keyframes sh-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
