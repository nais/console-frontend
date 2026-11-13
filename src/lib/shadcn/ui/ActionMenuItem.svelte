<script lang="ts">
	import { DropdownMenu, mergeProps } from 'bits-ui';
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';

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
		id,
		icon: IconOrSnippet,
		class: className = '',
		children,
		...rest
	}: Props = $props();
	const attributes: Record<string, unknown> = $derived(rest);
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

<DropdownMenu.Item {disabled} id={id ?? undefined}>
	{#snippet child({ props })}
		{#if href !== undefined}
			<a
				{...mergeProps(attributes, props, {
					onclick: (event: MouseEvent & { currentTarget: HTMLAnchorElement }) => {
						if (disabled) {
							event.preventDefault();
							return;
						}
						onselect?.(event);
					}
				})}
				href={disabled ? undefined : href}
				class={['sh-action-menu-item', `variant-${variant}`, { disabled }, className]}
			>
				{@render renderIcon()}
				<span>{@render children()}</span>
			</a>
		{:else}
			<button
				{...mergeProps(attributes, props, {
					onclick: (event: MouseEvent & { currentTarget: HTMLButtonElement }) => {
						if (!disabled) onselect?.(event);
					}
				})}
				type="button"
				{disabled}
				class={['sh-action-menu-item', `variant-${variant}`, { disabled }, className]}
			>
				{@render renderIcon()}
				<span>{@render children()}</span>
			</button>
		{/if}
	{/snippet}
</DropdownMenu.Item>

<style>
	.sh-action-menu-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: var(--nais-space-8);
		padding: var(--nais-space-6) var(--nais-space-10);
		border: none;
		border-radius: var(--radius-2xs);
		background: transparent;
		color: var(--popover-foreground);
		font-family: inherit;
		font-size: var(--sh-font-size-sm);
		text-align: left;
		text-decoration: none;
		cursor: pointer;
	}
	.sh-action-menu-item:hover:not(.disabled),
	.sh-action-menu-item[data-highlighted]:not(.disabled) {
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
