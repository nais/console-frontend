<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		href?: string;
		icon?: Component;
		active?: boolean;
		target?: string;
		rel?: string;
		ariaCurrent?: 'page';
		onSelect?: (event: MouseEvent) => void;
		children: Snippet;
		class?: string;
	} & HTMLAnchorAttributes &
		HTMLButtonAttributes;

	let {
		href,
		icon,
		active = false,
		target,
		rel,
		ariaCurrent,
		onSelect,
		onclick: rawOnclick,
		children,
		class: className,
		...restProps
	}: Props = $props();

	function handleClick(event: MouseEvent) {
		onSelect?.(event);
		(rawOnclick as ((event: MouseEvent) => void) | undefined)?.(event);
	}
</script>

{#if href}
	<a
		{...restProps}
		{href}
		{target}
		{rel}
		role="menuitem"
		data-marker={icon ? 'left' : undefined}
		class={[
			'ds-svelte-action-menu__item',
			'aksel-action-menu__item',
			'header-action-menu-item',
			className
		]}
		aria-current={ariaCurrent}
		onclick={handleClick}
	>
		<span class="action-menu-label" style:font-weight={active ? 'bold' : 'normal'}>
			{@render children()}
		</span>
		{#if icon}
			{@const Icon = icon}
			<div aria-hidden="true" class="aksel-action-menu__marker aksel-action-menu__marker--left">
				<Icon />
			</div>
		{/if}
	</a>
{:else}
	<button
		{...restProps}
		type="button"
		role="menuitem"
		data-marker={icon ? 'left' : undefined}
		class={[
			'ds-svelte-action-menu__item',
			'aksel-action-menu__item',
			'header-action-menu-item',
			className
		]}
		onclick={handleClick}
	>
		<span class="action-menu-label" style:font-weight={active ? 'bold' : 'normal'}>
			{@render children()}
		</span>
		{#if icon}
			{@const Icon = icon}
			<div aria-hidden="true" class="aksel-action-menu__marker aksel-action-menu__marker--left">
				<Icon />
			</div>
		{/if}
	</button>
{/if}

<style>
	.action-menu-label {
		color: var(--ax-text-neutral);
		display: inline-flex;
		align-items: center;
		gap: var(--ax-space-2);
	}

	.header-action-menu-item {
		width: 100%;
		box-sizing: border-box;
		background: transparent;
		border: none;
		color: inherit;
		text-decoration: none;
		text-align: left;
		font: inherit;
		cursor: pointer;
	}
</style>
