<script lang="ts" generics="T extends string = string">
	import { DropdownMenu } from 'bits-ui';
	import { CheckmarkIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		value: T;
		disabled?: boolean;
		onselect?: (value: T) => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let { value, disabled = false, onselect, children: content, ...rest }: Props = $props();
</script>

<DropdownMenu.RadioItem
	{...rest}
	{value}
	{disabled}
	onSelect={() => onselect?.(value)}
	class="sh-action-menu-radioitem"
>
	{#snippet children({ checked })}
		<span class="sh-radio-indicator" aria-hidden="true">
			{#if checked}<CheckmarkIcon />{/if}
		</span>
		<span>{@render content()}</span>
	{/snippet}
</DropdownMenu.RadioItem>

<style>
	:global(.sh-action-menu-radioitem) {
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
		font-size: var(--sh-font-size-sm);
		text-align: left;
		cursor: pointer;
	}
	:global(.sh-action-menu-radioitem:not([data-disabled]):hover),
	:global(.sh-action-menu-radioitem[data-highlighted]) {
		background-color: var(--secondary);
	}
	:global(.sh-action-menu-radioitem[data-disabled]) {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sh-radio-indicator {
		width: var(--ax-space-16);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--primary);
	}
</style>
