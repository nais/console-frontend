<script lang="ts">
	import { CheckmarkIcon, FilesIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		copyText: string;
		text?: string;
		activeText?: string;
		variant?: 'action' | 'neutral';
		size?: 'medium' | 'small' | 'xsmall';
		activeDuration?: number;
		title?: string;
		activeTitle?: string;
		iconPosition?: 'left' | 'right';
		activechanged?: (state: boolean) => void;
		icon?: Snippet;
		activeIcon?: Snippet;
		[key: string]: unknown;
	}

	let {
		copyText,
		text,
		activeText = 'Copied!',
		variant = 'neutral',
		size = 'medium',
		activeDuration = 2000,
		title = 'Copy to clipboard',
		activeTitle = 'Copied to clipboard',
		iconPosition = 'left',
		activechanged,
		icon,
		activeIcon,
		class: className = '',
		...rest
	}: Props = $props();

	let active = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function handleCopy(e: MouseEvent) {
		e.stopPropagation();
		if (typeof navigator !== 'undefined' && navigator.clipboard) {
			navigator.clipboard.writeText(copyText).catch(() => {});
		}
		if (timer) clearTimeout(timer);
		active = true;
		activechanged?.(true);
		timer = setTimeout(() => {
			active = false;
			activechanged?.(false);
		}, activeDuration);
	}
</script>

<button
	type="button"
	class={[
		'sh-copy-btn',
		`size-${size}`,
		`variant-${variant}`,
		{ active, 'icon-only': !text },
		className
	]}
	title={!text ? (active ? activeTitle : title) : undefined}
	aria-label={!text ? (active ? activeTitle : title) : undefined}
	onclick={handleCopy}
	{...rest}
>
	{#if iconPosition === 'left'}
		<span class="sh-copy-icon" aria-hidden="true">
			{#if active}
				{#if activeIcon}{@render activeIcon()}{:else}<CheckmarkIcon />{/if}
			{:else if icon}
				{@render icon()}
			{:else}
				<FilesIcon />
			{/if}
		</span>
	{/if}
	{#if text}
		<span>{active ? activeText : text}</span>
	{/if}
	{#if iconPosition === 'right'}
		<span class="sh-copy-icon" aria-hidden="true">
			{#if active}
				{#if activeIcon}{@render activeIcon()}{:else}<CheckmarkIcon />{/if}
			{:else if icon}
				{@render icon()}
			{:else}
				<FilesIcon />
			{/if}
		</span>
	{/if}
</button>

<style>
	.sh-copy-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid transparent;
		border-radius: calc(var(--radius) - 3px);
		background: transparent;
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: 0.78125rem;
		font-weight: 500;
		cursor: pointer;
		transition:
			background-color 110ms ease,
			color 110ms ease;
	}
	.sh-copy-btn.icon-only {
		padding: 0.25rem;
	}
	.sh-copy-btn:hover {
		background-color: var(--secondary);
		color: var(--foreground);
	}
	.sh-copy-btn.active {
		color: var(--status-success-fg);
	}
	.sh-copy-icon {
		display: inline-flex;
		align-items: center;
	}
</style>
