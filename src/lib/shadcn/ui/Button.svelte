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
		gap: 0.4rem;
		white-space: nowrap;
		border-radius: calc(var(--radius) - 2px);
		font-family: inherit;
		font-weight: 500;
		font-size: 0.8125rem;
		line-height: 1.25rem;
		text-decoration: none;
		border: 1px solid transparent;
		cursor: pointer;
		transition:
			background-color 120ms ease,
			border-color 120ms ease,
			color 120ms ease,
			box-shadow 120ms ease;
	}

	.sh-ui-btn:focus-visible {
		outline: 2px solid var(--ring);
		outline-offset: 2px;
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
		height: 2.25rem;
		padding: 0 0.875rem;
		font-size: 0.875rem;
	}
	.size-sm {
		height: 2rem;
		padding: 0 0.6875rem;
		font-size: 0.8125rem;
	}
	.size-xs {
		height: 1.625rem;
		padding: 0 0.5rem;
		font-size: 0.75rem;
		border-radius: calc(var(--radius) - 3px);
	}
	.size-lg {
		height: 2.5rem;
		padding: 0 1.25rem;
		font-size: 0.9375rem;
	}
	.size-icon {
		width: 2.125rem;
		height: 2.125rem;
		padding: 0;
	}
	.size-icon-sm {
		width: 1.875rem;
		height: 1.875rem;
		padding: 0;
	}
	.size-icon-xs {
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
	}

	.sh-ui-btn__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		flex-shrink: 0;
	}

	.sh-ui-btn__label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
</style>
