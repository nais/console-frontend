<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import Loader from './Loader.svelte';

	export interface ButtonProps {
		as?: 'button' | 'a';
		href?: string;
		variant?:
			| 'primary'
			| 'primary-neutral'
			| 'secondary'
			| 'secondary-neutral'
			| 'tertiary'
			| 'tertiary-neutral'
			| 'danger'
			| 'default'
			| 'outline'
			| 'ghost'
			| 'destructive'
			| 'brand';
		size?: 'medium' | 'small' | 'xsmall' | 'default' | 'sm' | 'xs' | 'lg' | 'icon' | 'icon-sm';
		loading?: boolean;
		disabled?: boolean | null;
		icon?: Snippet | Component;
		iconPosition?: 'left' | 'right';
		ref?: Element;
		children?: Snippet;
		class?: string;
		type?: 'button' | 'submit' | 'reset';
		ariaLabel?: string;
		ariaExpanded?: boolean;
		[key: string]: unknown;
	}

	let {
		as,
		href,
		variant = 'primary',
		size = 'medium',
		loading = false,
		disabled = false,
		icon,
		iconPosition = 'left',
		ref = $bindable(),
		children,
		class: className = '',
		type = 'button',
		ariaLabel,
		ariaExpanded,
		...rest
	}: ButtonProps = $props();

	let tag = $derived(as ?? (href ? 'a' : 'button'));
	let isDisabled = $derived(Boolean(disabled || loading));

	let normalizedVariant = $derived.by(() => {
		switch (variant) {
			case 'primary':
			case 'primary-neutral':
			case 'default':
				return 'default';
			case 'brand':
				return 'brand';
			case 'secondary':
			case 'secondary-neutral':
			case 'outline':
				return 'outline';
			case 'tertiary':
			case 'tertiary-neutral':
			case 'ghost':
				return 'ghost';
			case 'danger':
			case 'destructive':
				return 'destructive';
			default:
				return 'default';
		}
	});

	let normalizedSize = $derived.by(() => {
		const iconOnly = Boolean(icon && !children);
		switch (size) {
			case 'xsmall':
			case 'xs':
				return iconOnly ? 'icon-xs' : 'xs';
			case 'small':
			case 'sm':
				return iconOnly ? 'icon-sm' : 'sm';
			case 'icon':
			case 'icon-sm':
			case 'lg':
				return size;
			default:
				return iconOnly ? 'icon' : 'default';
		}
	});

	function isSnippetFn(val: unknown): val is Snippet {
		return typeof val === 'function' && val.length === 1;
	}
</script>

{#snippet renderIcon()}
	{#if icon}
		<span class="sh-ui-btn__icon">
			{#if isSnippetFn(icon)}
				{@render icon()}
			{:else}
				{const IconComp = $derived(icon as Component)}
				<IconComp aria-hidden="true" />
			{/if}
		</span>
	{/if}
{/snippet}

{#if tag === 'a'}
	<a
		bind:this={ref}
		href={isDisabled ? undefined : href}
		class={['sh-ui-btn', `variant-${normalizedVariant}`, `size-${normalizedSize}`, className]}
		aria-label={ariaLabel}
		aria-disabled={isDisabled ? 'true' : undefined}
		{...rest}
	>
		{#if loading}
			<Loader size="small" />
		{:else if icon && iconPosition === 'left'}
			{@render renderIcon()}
		{/if}
		{#if children}
			<span class="sh-ui-btn__label">{@render children()}</span>
		{/if}
		{#if !loading && icon && iconPosition === 'right'}
			{@render renderIcon()}
		{/if}
	</a>
{:else}
	<button
		bind:this={ref}
		{type}
		disabled={isDisabled}
		class={['sh-ui-btn', `variant-${normalizedVariant}`, `size-${normalizedSize}`, className]}
		aria-label={ariaLabel}
		aria-expanded={ariaExpanded}
		{...rest}
	>
		{#if loading}
			<Loader size="small" />
		{:else if icon && iconPosition === 'left'}
			{@render renderIcon()}
		{/if}
		{#if children}
			<span class="sh-ui-btn__label">{@render children()}</span>
		{/if}
		{#if !loading && icon && iconPosition === 'right'}
			{@render renderIcon()}
		{/if}
	</button>
{/if}

<style>
	.sh-ui-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--ax-space-6);
		white-space: nowrap;
		border-radius: var(--radius-sm);
		font-family: inherit;
		font-weight: var(--sh-font-weight-medium);
		font-size: var(--ax-font-size-small);
		line-height: var(--ax-space-20);
		text-decoration: none;
		border: var(--sh-border-width) solid transparent;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			color 120ms ease,
			box-shadow 120ms ease;
	}

	.sh-ui-btn:focus-visible {
		outline: var(--ax-space-2) solid var(--ring);
		outline-offset: var(--ax-space-2);
	}

	.sh-ui-btn:disabled,
	.sh-ui-btn[aria-disabled='true'] {
		opacity: 0.5;
		pointer-events: none;
	}

	.variant-default {
		background-color: var(--primary);
		color: var(--primary-foreground);
		box-shadow: var(--sh-shadow-xs);
	}
	.variant-default:hover {
		background-color: var(--primary-hover);
	}

	.variant-brand {
		background: var(--brand-accent-gradient);
		color: var(--primary-foreground);
		box-shadow: var(--sh-shadow-sm);
		border-color: transparent;
	}
	.variant-brand:hover {
		filter: brightness(1.06);
	}

	.variant-outline {
		background-color: var(--card);
		color: var(--foreground);
		border-color: var(--border);
		box-shadow: var(--sh-shadow-xs);
	}
	.variant-outline:hover {
		background-color: var(--secondary);
		border-color: var(--border-strong);
	}

	.variant-ghost {
		background-color: transparent;
		color: var(--muted-foreground);
	}
	.variant-ghost:hover {
		background-color: var(--secondary);
		color: var(--foreground);
	}

	.variant-destructive {
		background-color: var(--destructive-muted);
		color: var(--destructive);
		border-color: var(--destructive-border);
	}
	.variant-destructive:hover {
		background-color: var(--destructive);
		color: var(--destructive-foreground);
	}

	.size-default {
		height: var(--ax-space-36);
		padding: 0 var(--ax-space-14);
		font-size: var(--sh-font-size-sm);
	}
	.size-sm {
		height: var(--ax-space-32);
		padding: 0 var(--ax-space-10);
		font-size: var(--ax-font-size-small);
	}
	.size-xs {
		height: var(--ax-space-24);
		padding: 0 var(--ax-space-8);
		font-size: var(--sh-font-size-xs);
		border-radius: var(--radius-xs);
	}
	.size-lg {
		height: var(--ax-space-40);
		padding: 0 var(--ax-space-20);
		font-size: var(--ax-font-size-medium);
	}
	.size-icon {
		width: var(--ax-space-32);
		height: var(--ax-space-32);
		padding: 0;
	}
	.size-icon-sm {
		width: var(--ax-space-28);
		height: var(--ax-space-28);
		padding: 0;
	}
	.size-icon-xs {
		width: var(--ax-space-24);
		height: var(--ax-space-24);
		padding: 0;
	}

	.sh-ui-btn__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: var(--sh-font-size-base);
		flex-shrink: 0;
	}

	.sh-ui-btn__label {
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-6);
	}
</style>
