<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	export type TagVariant =
		| 'warning'
		| 'warning-filled'
		| 'warning-moderate'
		| 'error'
		| 'error-filled'
		| 'error-moderate'
		| 'info'
		| 'info-filled'
		| 'info-moderate'
		| 'success'
		| 'success-filled'
		| 'success-moderate'
		| 'neutral'
		| 'neutral-filled'
		| 'neutral-moderate'
		| 'alt1'
		| 'alt1-filled'
		| 'alt1-moderate'
		| 'alt2'
		| 'alt2-filled'
		| 'alt2-moderate'
		| 'alt3'
		| 'alt3-filled'
		| 'alt3-moderate'
		| 'meta-purple'
		| 'meta-purple-filled'
		| 'meta-purple-moderate'
		| 'meta-lime'
		| 'meta-lime-filled'
		| 'meta-lime-moderate';

	export interface TagProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		variant?: TagVariant;
		size?: 'medium' | 'small' | 'xsmall';
		children: Snippet | string;
		icon?: Snippet | Component;
		[key: string]: unknown;
	}

	let {
		variant = 'neutral',
		size = 'medium',
		icon,
		class: className = '',
		children,
		...rest
	}: TagProps = $props();

	let tone = $derived.by(() => {
		if (variant.startsWith('error')) return 'destructive';
		if (variant.startsWith('warning')) return 'warning';
		if (variant.startsWith('success') || variant.startsWith('meta-lime')) return 'success';
		if (
			variant.startsWith('info') ||
			variant.startsWith('alt1') ||
			variant.startsWith('alt3') ||
			variant.startsWith('meta-purple')
		)
			return 'info';
		return 'secondary';
	});

	function isSnippetFn(val: unknown): val is Snippet {
		return typeof val === 'function' && val.length === 1;
	}
</script>

<span class={['sh-ui-tag', `tone-${tone}`, `size-${size}`, className]} {...rest}>
	{#if icon}
		<span class="sh-ui-tag__icon">
			{#if isSnippetFn(icon)}
				{@render icon()}
			{:else}
				{const IconComp = $derived(icon as Component)}
				<IconComp aria-hidden="true" />
			{/if}
		</span>
	{/if}
	{#if typeof children === 'string'}
		{children}
	{:else}
		{@render children()}
	{/if}
</span>

<style>
	.sh-ui-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		border-radius: calc(var(--radius) - 3px);
		font-weight: 500;
		border: 1px solid transparent;
		white-space: nowrap;
		line-height: 1.25;
		font-variant-numeric: tabular-nums;
	}
	.size-medium {
		padding: 0.15rem 0.5rem;
		font-size: 0.75rem;
	}
	.size-small {
		padding: 0.1rem 0.425rem;
		font-size: 0.6875rem;
	}
	.size-xsmall {
		padding: 0.05rem 0.35rem;
		font-size: 0.65rem;
	}
	.tone-secondary {
		background-color: var(--secondary);
		color: var(--secondary-foreground);
		border-color: var(--border);
	}
	.tone-info {
		background-color: var(--info-muted);
		color: var(--info);
		border-color: var(--info-border);
	}
	.tone-success {
		background-color: var(--success-muted);
		color: var(--success);
		border-color: var(--success-border);
	}
	.tone-warning {
		background-color: var(--warning-muted);
		color: var(--warning);
		border-color: var(--warning-border);
	}
	.tone-destructive {
		background-color: var(--destructive-muted);
		color: var(--destructive);
		border-color: var(--destructive-border);
	}
	.sh-ui-tag__icon {
		display: inline-flex;
		align-items: center;
		font-size: 0.9em;
	}
</style>
