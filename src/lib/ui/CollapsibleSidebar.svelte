<script lang="ts">
	import { Modal } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';

	let {
		children,
		extras,
		open = $bindable(false),
		label = 'Filters'
	}: {
		children?: Snippet;
		extras?: Snippet;
		open?: boolean;
		label?: string;
	} = $props();

	const isDesktop = new MediaQuery('(min-width: 1025px)');

	$effect(() => {
		if (isDesktop.current) {
			open = false;
		}
	});
</script>

<div class="sidebar-column">
	{#if children}
		<div class="layout-sidebar desktop-only">
			{@render children()}
		</div>
	{/if}

	{#if extras}
		<div class="sidebar-extras">
			{@render extras()}
		</div>
	{/if}
</div>

{#if open && children}
	<Modal bind:open header={{ heading: label, size: 'small' }} class="filter-drawer">
		<div class="drawer-content">
			{@render children()}
		</div>
	</Modal>
{/if}

<style>
	.sidebar-column {
		display: flex;
		flex-direction: column;
		gap: var(--ax-space-16);
		align-self: start;
	}

	.desktop-only {
		display: grid;
		gap: var(--ax-space-16);
		align-content: start;
	}

	@media (max-width: 1024px) {
		.desktop-only {
			display: none;
		}
	}

	:global(dialog.filter-drawer.aksel-modal) {
		inset: 0 0 0 auto;
		margin: 0;
		display: flex;
		width: 320px;
		max-width: calc(100vw - var(--ax-space-16));
		max-height: 100dvh;
		height: 100dvh;
		flex-direction: column;
		border: none;
		border-radius: 0;
		padding: 0;
		background: var(--ax-bg-default);
		box-shadow: -4px 0 24px rgb(15 23 42 / 0.16);
		animation: filter-drawer-enter 160ms ease-out;
	}

	:global(dialog.filter-drawer::backdrop) {
		background: rgb(15 23 42 / 0.38);
		animation: filter-backdrop-enter 160ms ease-out;
	}

	:global(dialog.filter-drawer .aksel-modal__header) {
		padding: var(--ax-space-16);
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
	}

	:global(dialog.filter-drawer .aksel-modal__body) {
		flex: 1;
		min-height: 0;
		padding: 0;
		overflow-y: auto;
	}

	.drawer-content {
		padding: var(--ax-space-16);
		display: grid;
		gap: var(--spacing-sidebar);
		align-content: start;
	}

	@keyframes filter-drawer-enter {
		from {
			transform: translateX(24px);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes filter-backdrop-enter {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(dialog.filter-drawer.aksel-modal) {
			animation: none;
		}
		:global(dialog.filter-drawer::backdrop) {
			animation: none;
		}
	}

	@media (min-width: 1025px) {
		:global(dialog.filter-drawer.aksel-modal) {
			display: none;
		}
	}
</style>
