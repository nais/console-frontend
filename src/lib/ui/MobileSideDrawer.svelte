<script lang="ts">
	import { Modal } from '@nais/ds-svelte-community';
	import type { Snippet } from 'svelte';

	interface Props {
		id?: string;
		headerContent?: Snippet;
		title?: string;
		open?: boolean;
		width?: number | 'small' | 'medium' | `${number}${string}`;
		children: Snippet;
	}

	let {
		id,
		headerContent,
		title,
		open = $bindable(false),
		width = '22rem',
		children
	}: Props = $props();
</script>

<Modal
	bind:open
	{id}
	{width}
	header={headerContent ?? (title ? { heading: title, size: 'small' } : undefined)}
	class="mobile-side-drawer"
>
	<div class="drawer-content">
		{@render children()}
	</div>
</Modal>

<style>
	:global(dialog.mobile-side-drawer.aksel-modal) {
		inset: 0 auto 0 0;
		margin: 0;
		display: flex;
		max-width: calc(100vw - var(--ax-space-16));
		max-height: 100dvh;
		height: 100dvh;
		flex-direction: column;
		border: none;
		border-radius: 0;
		padding: 0;
		background: var(--ax-bg-default);
		box-shadow: 0 20px 48px rgb(15 23 42 / 0.24);
		animation: drawer-enter 160ms ease-out;
	}

	:global(dialog.mobile-side-drawer::backdrop) {
		background: rgb(15 23 42 / 0.38);
		animation: backdrop-enter 160ms ease-out;
	}

	:global(dialog.mobile-side-drawer .aksel-modal__header) {
		padding: var(--ax-space-12);
		border-bottom: 1px solid var(--ax-border-neutral-subtleA);
		background: var(--ax-bg-raised);
	}

	:global(dialog.mobile-side-drawer .aksel-modal__body) {
		flex: 1;
		min-height: 0;
		padding: 0;
		overflow: auto;
	}

	.drawer-content {
		min-height: 100%;
		padding: var(--ax-space-12);
		background: var(--ax-bg-default);
	}

	@keyframes drawer-enter {
		from {
			transform: translateX(-24px);
			opacity: 0;
		}

		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes backdrop-enter {
		from {
			opacity: 0;
		}

		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(dialog.mobile-side-drawer.aksel-modal) {
			animation: none;
		}

		:global(dialog.mobile-side-drawer::backdrop) {
			animation: none;
		}
	}
</style>
