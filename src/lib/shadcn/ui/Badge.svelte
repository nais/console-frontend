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
		gap: var(--nais-space-6);
		border-radius: var(--radius-full);
		font-weight: var(--sh-font-weight-semibold);
		border: var(--sh-border-width) solid transparent;
		white-space: nowrap;
		line-height: 1.2;
		letter-spacing: 0.01em;
		font-variant-numeric: tabular-nums;
	}

	.sh-badge-comp.mono {
		font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
		border-radius: var(--radius-2xs);
		font-weight: var(--sh-font-weight-medium);
	}

	.size-default {
		padding: var(--nais-space-4) var(--nais-space-10);
		font-size: var(--sh-font-size-xs);
	}

	.size-sm {
		padding: var(--nais-space-2) var(--nais-space-8);
		font-size: var(--sh-font-size-caption);
	}

	.size-xs {
		padding: var(--nais-space-1) var(--nais-space-6);
		font-size: var(--sh-font-size-micro);
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
		border-radius: var(--radius-2xs);
	}

	.variant-env-dev {
		background-color: var(--secondary);
		color: var(--muted-foreground);
		border-color: var(--border);
		border-radius: var(--radius-2xs);
	}

	.dot {
		width: var(--nais-space-6);
		height: var(--nais-space-6);
		border-radius: var(--radius-full);
		background-color: currentColor;
		flex-shrink: 0;
	}

	.dot.pulse {
		box-shadow: 0 0 0 var(--nais-space-2) color-mix(in srgb, currentColor 28%, transparent);
	}
</style>
