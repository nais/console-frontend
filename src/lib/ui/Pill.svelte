<script lang="ts">
	interface Props {
		variant: 'critical' | 'warning' | 'todo' | 'success' | 'neutral' | 'info';
		children: import('svelte').Snippet;
	}

	let { variant, children }: Props = $props();
</script>

<span class="pill {variant}">
	{@render children()}
</span>

<style>
	.pill {
		font-size: var(--ax-font-size-small);
		font-weight: var(--ax-font-weight-bold);
		border-radius: var(--ax-radius-8);
		padding: 0 var(--ax-space-6);
		white-space: nowrap;
	}

	.pill.critical {
		color: var(--ax-text-danger);
		background: var(--ax-bg-danger-moderate);
	}

	.pill.warning {
		color: var(--ax-text-warning);
		background: var(--ax-bg-warning-moderate);
	}

	.pill.success {
		color: var(--ax-text-success);
		background: var(--ax-bg-success-moderate);
	}

	.pill.todo,
	.pill.info {
		color: var(--ax-text-accent);
		background: color-mix(in srgb, var(--ax-text-accent) 12%, transparent);
	}

	.pill.neutral {
		color: var(--ax-text-neutral-subtle);
		background: var(--ax-bg-neutral-moderate);
	}
</style>
