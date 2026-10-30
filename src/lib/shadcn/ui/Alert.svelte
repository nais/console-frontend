<script lang="ts">
	import {
		CheckmarkCircleIcon,
		ExclamationmarkTriangleIcon,
		InformationSquareIcon,
		XMarkIcon,
		XMarkOctagonIcon
	} from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'error' | 'warning' | 'info' | 'success' | 'default' | 'destructive';
		size?: 'medium' | 'small' | 'default' | 'sm';
		title?: string;
		fullWidth?: boolean;
		inline?: boolean;
		iconTitleText?: string;
		contentMaxWidth?: boolean;
		closeButton?: boolean;
		closeButtonIconText?: string;
		onclose?: () => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		variant = 'info',
		size = 'medium',
		title,
		fullWidth = false,
		inline = false,
		closeButton = false,
		closeButtonIconText = 'Close',
		onclose,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	let normalizedVariant = $derived(variant === 'error' ? 'destructive' : variant);
	let isSmall = $derived(size === 'small' || size === 'sm');
</script>

<div
	role={normalizedVariant === 'destructive' ? 'alert' : 'status'}
	class={[
		'sh-ui-alert',
		`variant-${normalizedVariant}`,
		{
			'size-sm': isSmall,
			'full-width': fullWidth,
			inline
		},
		className
	]}
	{...rest}
>
	<span class="sh-ui-alert__icon" aria-hidden="true">
		{#if normalizedVariant === 'destructive'}
			<XMarkOctagonIcon />
		{:else if normalizedVariant === 'warning'}
			<ExclamationmarkTriangleIcon />
		{:else if normalizedVariant === 'success'}
			<CheckmarkCircleIcon />
		{:else}
			<InformationSquareIcon />
		{/if}
	</span>
	<div class="sh-ui-alert__content">
		{#if title}
			<h5 class="sh-ui-alert__title">{title}</h5>
		{/if}
		{@render children()}
	</div>
	{#if closeButton}
		<button
			type="button"
			class="sh-ui-alert__close"
			aria-label={closeButtonIconText}
			onclick={() => onclose?.()}
		>
			<XMarkIcon aria-hidden="true" />
		</button>
	{/if}
</div>

<style>
	.sh-ui-alert {
		position: relative;
		width: 100%;
		border-radius: var(--radius);
		border: 1px solid var(--border);
		background-color: var(--card);
		color: var(--foreground);
		padding: 0.75rem 1rem;
		display: flex;
		align-items: flex-start;
		gap: 0.65rem;
		font-size: 0.84375rem;
		line-height: 1.45;
		box-sizing: border-box;
	}
	.sh-ui-alert.size-sm {
		padding: 0.55rem 0.75rem;
		font-size: 0.8125rem;
	}
	.sh-ui-alert.full-width {
		border-radius: 0;
	}
	.sh-ui-alert.inline {
		background-color: transparent;
		border: none;
		padding: 0.25rem 0;
	}
	.sh-ui-alert__icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 1rem;
		margin-top: 0.125rem;
		flex-shrink: 0;
	}
	.sh-ui-alert__content {
		flex: 1;
		min-width: 0;
		overflow-wrap: anywhere;
	}
	.sh-ui-alert__title {
		margin: 0 0 0.25rem;
		font-weight: 600;
		font-size: 0.875rem;
		line-height: 1.3;
	}
	.sh-ui-alert__close {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border: none;
		border-radius: calc(var(--radius) - 4px);
		background: transparent;
		color: currentColor;
		opacity: 0.7;
		cursor: pointer;
		flex-shrink: 0;
	}
	.sh-ui-alert__close:hover {
		opacity: 1;
		background-color: color-mix(in srgb, currentColor 12%, transparent);
	}
	.sh-ui-alert.variant-destructive {
		border-color: var(--destructive-border);
		background-color: var(--destructive-muted);
		color: var(--destructive);
	}
	.sh-ui-alert.variant-warning {
		border-color: var(--warning-border);
		background-color: var(--warning-muted);
	}
	.sh-ui-alert.variant-warning .sh-ui-alert__icon {
		color: var(--warning);
	}
	.sh-ui-alert.variant-info {
		border-color: var(--info-border);
		background-color: var(--info-muted);
	}
	.sh-ui-alert.variant-info .sh-ui-alert__icon {
		color: var(--info);
	}
	.sh-ui-alert.variant-success {
		border-color: var(--success-border);
		background-color: var(--success-muted);
	}
	.sh-ui-alert.variant-success .sh-ui-alert__icon {
		color: var(--success);
	}
</style>
