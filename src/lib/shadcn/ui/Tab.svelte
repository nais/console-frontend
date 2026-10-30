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
		aria-selected={isActive}
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
		aria-selected={isActive}
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
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 0.875rem;
		font-size: 0.84375rem;
		font-weight: 500;
		color: var(--muted-foreground);
		text-decoration: none;
		background: transparent;
		border: none;
		border-radius: calc(var(--radius) - 3px) calc(var(--radius) - 3px) 0 0;
		white-space: nowrap;
		cursor: pointer;
	}
	.sh-ui-tab:hover {
		color: var(--foreground);
		background-color: var(--secondary);
	}
	.sh-ui-tab.active {
		color: var(--foreground);
		font-weight: 600;
	}
	.sh-ui-tab.active::after {
		content: '';
		position: absolute;
		left: 0.5rem;
		right: 0.5rem;
		bottom: -1px;
		height: 2px;
		background: var(--primary);
	}
</style>
