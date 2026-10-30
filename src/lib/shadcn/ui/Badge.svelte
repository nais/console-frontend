<script lang="ts">
	import type { Snippet } from 'svelte';

	export type BadgeVariant =
		| 'default'
		| 'secondary'
		| 'outline'
		| 'success'
		| 'warning'
		| 'destructive'
		| 'info'
		| 'env-prod'
		| 'env-dev';

	interface Props {
		variant?: BadgeVariant;
		size?: 'default' | 'sm' | 'xs';
		dot?: boolean;
		pulse?: boolean;
		mono?: boolean;
		class?: string;
		children: Snippet;
	}

	let {
		variant = 'secondary',
		size = 'default',
		dot = false,
		pulse = false,
		mono = false,
		class: className = '',
		children
	}: Props = $props();
</script>

<span class="sh-badge-comp variant-{variant} size-{size} {mono ? 'mono' : ''} {className}">
	{#if dot}
		<span class="dot" class:pulse aria-hidden="true"></span>
	{/if}
	{@render children()}
</span>

<style>
	.sh-badge-comp {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border-radius: 9999px;
		font-weight: 600;
		border: 1px solid transparent;
		white-space: nowrap;
		line-height: 1.2;
		letter-spacing: 0.01em;
		font-variant-numeric: tabular-nums;
	}

	.sh-badge-comp.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		border-radius: calc(var(--radius) - 4px);
		font-weight: 500;
	}

	.size-default {
		padding: 0.2rem 0.625rem;
		font-size: 0.75rem;
	}

	.size-sm {
		padding: 0.125rem 0.5rem;
		font-size: 0.6875rem;
	}

	.size-xs {
		padding: 0.075rem 0.4rem;
		font-size: 0.65rem;
	}

	.variant-default {
		background-color: var(--primary-muted);
		color: var(--primary);
		border-color: var(--primary-border);
	}

	.variant-secondary {
		background-color: var(--secondary);
		color: var(--secondary-foreground);
		border-color: var(--border);
	}

	.variant-outline {
		background-color: transparent;
		color: var(--muted-foreground);
		border-color: var(--border-strong);
	}

	.variant-success {
		background-color: var(--success-muted);
		color: var(--success);
		border-color: var(--success-border);
	}

	.variant-warning {
		background-color: var(--warning-muted);
		color: var(--warning);
		border-color: var(--warning-border);
	}

	.variant-destructive {
		background-color: var(--destructive-muted);
		color: var(--destructive);
		border-color: var(--destructive-border);
	}

	.variant-info {
		background-color: var(--info-muted);
		color: var(--info);
		border-color: var(--info-border);
	}

	.variant-env-prod {
		background-color: var(--primary-muted);
		color: var(--primary);
		border-color: var(--primary-border);
		border-radius: calc(var(--radius) - 4px);
	}

	.variant-env-dev {
		background-color: var(--secondary);
		color: var(--muted-foreground);
		border-color: var(--border);
		border-radius: calc(var(--radius) - 4px);
	}

	.dot {
		width: 0.425rem;
		height: 0.425rem;
		border-radius: 9999px;
		background-color: currentColor;
		flex-shrink: 0;
	}

	.dot.pulse {
		box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 28%, transparent);
	}
</style>
