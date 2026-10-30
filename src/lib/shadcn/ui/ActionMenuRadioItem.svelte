<script lang="ts" generics="T = unknown">
	import { CheckmarkIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import { GetActionMenuContext } from './ActionMenu.svelte';
	import { GetActionMenuRadioContext } from './ActionMenuRadioGroup.svelte';

	interface Props {
		value: T;
		onselect?: (value: T) => void;
		children: Snippet;
		[key: string]: unknown;
	}

	let { value, onselect, children }: Props = $props();

	const radioCtx = GetActionMenuRadioContext();
	const menuCtx = GetActionMenuContext();
	let checked = $derived(radioCtx?.value === value);
</script>

<button
	type="button"
	role="menuitemradio"
	aria-checked={checked}
	class="sh-action-menu-radioitem"
	onclick={() => {
		onselect?.(value);
		radioCtx?.select(value);
		menuCtx?.close();
	}}
>
	<span class="sh-radio-indicator" aria-hidden="true">
		{#if checked}<CheckmarkIcon />{/if}
	</span>
	<span>{@render children()}</span>
</button>

<style>
	.sh-action-menu-radioitem {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.375rem 0.625rem;
		border: none;
		border-radius: calc(var(--radius) - 4px);
		background: transparent;
		color: var(--popover-foreground);
		font-family: inherit;
		font-size: 0.8125rem;
		text-align: left;
		cursor: pointer;
	}
	.sh-action-menu-radioitem:hover {
		background-color: var(--secondary);
	}
	.sh-radio-indicator {
		width: 1rem;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: var(--primary);
	}
</style>
