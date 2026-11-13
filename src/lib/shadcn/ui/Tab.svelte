<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { GetTabsUiContext } from './Tabs.svelte';

	interface Props extends HTMLAttributes<HTMLElement> {
		value: string;
		label?: string;
		children?: Snippet;
		icon?: Snippet;
		as?: 'button' | 'a';
		href?: string;
		[key: string]: unknown;
	}

	let { value, label, children, icon, as, href, class: className = '', ...rest }: Props = $props();

	const ctx = GetTabsUiContext();
	let isActive = $derived(ctx?.value === value);
	let tag = $derived(as ?? (href ? 'a' : 'button'));
</script>

{#if tag === 'a'}
	<a
		{href}
		role="tab"
		id={ctx?.tabId(value)}
		aria-controls={ctx?.panelId(value)}
		aria-selected={isActive}
		tabindex={isActive ? 0 : -1}
		class={['sh-ui-tab', { active: isActive }, className]}
		onclick={() => ctx?.activate(value)}
		{...rest}
	>
		{@render icon?.()}
		{#if label}{label}{:else}{@render children?.()}{/if}
	</a>
{:else}
	<button
		type="button"
		role="tab"
		id={ctx?.tabId(value)}
		aria-controls={ctx?.panelId(value)}
		aria-selected={isActive}
		tabindex={isActive ? 0 : -1}
		class={['sh-ui-tab', { active: isActive }, className]}
		onclick={() => ctx?.activate(value)}
		{...rest}
	>
		{@render icon?.()}
		{#if label}{label}{:else}{@render children?.()}{/if}
	</button>
{/if}

<style>
	.sh-ui-tab {
		position: relative;
		display: inline-flex;
		flex-shrink: 0;
		align-items: center;
		gap: var(--nais-space-6);
		padding: var(--nais-space-8) var(--nais-space-14);
		font-size: var(--sh-font-size-body);
		font-weight: var(--sh-font-weight-medium);
		color: var(--muted-foreground);
		text-decoration: none;
		background: transparent;
		border: none;
		border-radius: var(--radius-xs) var(--radius-xs) 0 0;
		white-space: nowrap;
		cursor: pointer;
	}
	.sh-ui-tab:hover {
		color: var(--foreground);
		background-color: var(--secondary);
	}
	.sh-ui-tab.active {
		color: var(--foreground);
		font-weight: var(--sh-font-weight-semibold);
	}
	.sh-ui-tab.active::after {
		content: '';
		position: absolute;
		left: var(--nais-space-8);
		right: var(--nais-space-8);
		bottom: 0;
		height: var(--nais-space-2);
		background: var(--primary);
	}
</style>
