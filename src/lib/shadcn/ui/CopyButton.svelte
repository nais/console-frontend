<script lang="ts">
	import { CheckmarkIcon, FilesIcon } from '#lib/icons/index.js';
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { onDestroy } from 'svelte';

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
	let error = $state('');
	let copying = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;
	let mounted = true;
	onDestroy(() => {
		mounted = false;
		if (timer) clearTimeout(timer);
	});

	async function handleCopy(e: MouseEvent) {
		e.stopPropagation();
		if (copying) return;
		if (timer) clearTimeout(timer);
		if (active) activechanged?.(false);
		active = false;
		error = '';
		if (!navigator.clipboard?.writeText) {
			error = 'Clipboard access is unavailable. Please copy the text manually.';
			return;
		}
		copying = true;
		try {
			await navigator.clipboard.writeText(copyText);
		} catch {
			if (mounted) error = 'Could not copy to the clipboard. Please try again.';
			return;
		} finally {
			if (mounted) copying = false;
		}
		if (!mounted) return;
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
{#if error}<span role="alert" class="copy-error">{error}</span>{/if}

<style>
	.copy-error {
		color: var(--destructive);
		font-size: var(--sh-font-size-sm);
	}
	.sh-copy-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--nais-space-6);
		padding: var(--nais-space-4) var(--nais-space-8);
		border: var(--sh-border-width) solid transparent;
		border-radius: var(--radius-xs);
		background: transparent;
		color: var(--muted-foreground);
		font-family: inherit;
		font-size: var(--sh-font-size-label);
		font-weight: var(--sh-font-weight-medium);
		cursor: pointer;
		transition:
			background-color 110ms ease,
			color 110ms ease;
	}
	.sh-copy-btn.icon-only {
		padding: var(--nais-space-4);
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
