<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { focusGroupItem } from './keyboardNavigation.js';
	import { GetTabsUiContext } from './Tabs.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		[key: string]: unknown;
	}

	let { class: className = '', children, onkeydown, onfocus, ...rest }: Props = $props();
	const ctx = GetTabsUiContext();
</script>

<div
	role="tablist"
	tabindex={ctx?.value ? undefined : 0}
	class={['sh-ui-tablist', className]}
	onfocus={(event) => {
		onfocus?.(event);
		if (event.target === event.currentTarget) {
			event.currentTarget
				.querySelector<HTMLElement>('[role="tab"]:not([disabled]):not([aria-disabled="true"])')
				?.focus();
		}
	}}
	onkeydown={(event) => {
		onkeydown?.(event);
		if (!event.defaultPrevented) {
			focusGroupItem(event, event.currentTarget, '[role="tab"]', 'horizontal');
		}
	}}
	{...rest}
>
	{@render children()}
</div>

<style>
	.sh-ui-tablist {
		display: flex;
		align-items: center;
		gap: var(--ax-space-4);
		border-bottom: var(--ax-space-1) solid var(--border);
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
	}
</style>
