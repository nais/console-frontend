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
		border-radius: var(--radius-full);
		border: var(--ax-space-2) solid var(--border);
		border-top-color: var(--muted-foreground);
		animation: sh-spin 650ms linear infinite;
	}

	.size-sm .sh-spinner-ring {
		width: var(--ax-space-14);
		height: var(--ax-space-14);
		border-width: var(--sh-border-width);
	}

	.size-md .sh-spinner-ring {
		width: var(--ax-space-20);
		height: var(--ax-space-20);
	}

	.size-lg .sh-spinner-ring {
		width: var(--ax-space-24);
		height: var(--ax-space-24);
	}

	@keyframes sh-spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
