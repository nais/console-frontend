<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { GetActionMenuContext } from './ActionMenu.svelte';

	interface CommonProps extends Omit<HTMLAttributes<HTMLElement>, 'onselect'> {
		variant?: 'default' | 'danger';
		disabled?: boolean;
		icon?: Snippet | Component<Record<string, unknown>>;
		children: Snippet;
		[key: string]: unknown;
	}

	type Props = CommonProps &
		(
			| { href: string; onselect?: HTMLAnchorAttributes['onclick'] }
			| { href?: undefined; onselect?: HTMLButtonAttributes['onclick'] }
		);

	const {
		variant = 'default',
		disabled = false,
		onselect,
		href,
		icon: IconOrSnippet,
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const ctx = GetActionMenuContext();
</script>

{#snippet renderIcon()}
	{#if IconOrSnippet}
		{#if IconOrSnippet.length > 0}
			{const IconComp = IconOrSnippet as Component}
			<IconComp aria-hidden="true" />
		{:else}
			{const iconSnippet = IconOrSnippet as Snippet}
			{@render iconSnippet()}
		{/if}
	{/if}
{/snippet}

{#if href !== undefined}
	<a
		{href}
		role="menuitem"
		aria-disabled={disabled || undefined}
		tabindex="-1"
		class={['sh-action-menu-item', `variant-${variant}`, { disabled }, className]}
		onclick={(event) => {
			if (disabled) {
				event.preventDefault();
				return;
			}
			onselect?.(event);
			ctx?.close();
		}}
		{...rest}
	>
		{@render renderIcon()}
		<span>{@render children()}</span>
	</a>
{:else}
	<button
		type="button"
		role="menuitem"
		tabindex="-1"
		{disabled}
		class={['sh-action-menu-item', `variant-${variant}`, { disabled }, className]}
		onclick={(event) => {
			if (disabled) return;
			onselect?.(event);
			ctx?.close();
		}}
		{...rest}
	>
		{@render renderIcon()}
		<span>{@render children()}</span>
	</button>
{/if}

<style>
	.sh-action-menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--ax-space-8);
		padding: var(--ax-space-6) var(--ax-space-10);
		border: none;
		border-radius: var(--radius-2xs);
		background: transparent;
		color: var(--popover-foreground);
		font-family: inherit;
		font-size: var(--ax-font-size-small);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}
	.sh-action-menu-item:hover:not(.disabled) {
		background-color: var(--secondary);
	}
	.sh-action-menu-item.variant-danger {
		color: var(--destructive);
	}
	.sh-action-menu-item.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
