<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { CheckmarkIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';

	interface Props {
		value?: string;
		checked?: boolean;
		disabled?: boolean;
		oncheckedchange?: (checked: boolean) => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let {
		checked = $bindable(false),
		disabled = false,
		oncheckedchange,
		children: content,
		...rest
	}: Props = $props();
</script>

<DropdownMenu.CheckboxItem
	{...rest}
	bind:checked
	{disabled}
	onCheckedChange={oncheckedchange}
	closeOnSelect={false}
	class="sh-action-menu-checkboxitem"
>
	<span class="sh-checkbox-indicator" aria-hidden="true">
		{#if checked}<CheckmarkIcon />{/if}
	</span>
	<span class="sh-checkbox-content">{@render content()}</span>
</DropdownMenu.CheckboxItem>

<style>
	:global(.sh-action-menu-checkboxitem) {
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
		cursor: pointer;
	}
	:global(.sh-action-menu-checkboxitem:not([data-disabled]):hover),
	:global(.sh-action-menu-checkboxitem[data-highlighted]) {
		background-color: var(--secondary);
	}
	:global(.sh-action-menu-checkboxitem[data-disabled]) {
		opacity: 0.5;
		cursor: not-allowed;
	}
	.sh-checkbox-indicator {
		width: var(--nais-space-16);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--primary);
		flex-shrink: 0;
	}
	.sh-checkbox-content {
		min-width: 0;
		flex: 1;
	}
</style>
