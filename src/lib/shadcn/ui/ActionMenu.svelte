<script lang="ts">
	import { DropdownMenu } from 'bits-ui';
	import { tick, type Snippet } from 'svelte';

	interface Props {
		open?: boolean;
		children: Snippet;
		trigger: Snippet<[Record<string, unknown>]>;
		[key: string]: unknown;
	}

	let { open = $bindable(false), children, trigger }: Props = $props();
	let triggerElement = $state<HTMLElement | null>(null);
	let menuElement = $state<HTMLElement | null>(null);
	let openFromEnd = $state(false);
	const portalTarget = $derived(
		triggerElement?.closest('[data-dialog-content], dialog, .sh-theme-root') ?? undefined
	);
</script>

<DropdownMenu.Root
	bind:open
	onOpenChange={(isOpen) => {
		if (!isOpen) openFromEnd = false;
	}}
>
	<div class="sh-action-menu">
		<DropdownMenu.Trigger
			bind:ref={triggerElement}
			onkeydown={(event) => {
				if (event.key === 'ArrowUp') {
					event.preventDefault();
					openFromEnd = true;
					open = true;
				}
			}}
		>
			{#snippet child({ props })}
				{@render trigger(props)}
			{/snippet}
		</DropdownMenu.Trigger>
	</div>
	<DropdownMenu.Portal to={portalTarget}>
		<DropdownMenu.Content
			bind:ref={menuElement}
			class="sh-action-menu-content"
			side="bottom"
			align="end"
			sideOffset={6}
			preventScroll={false}
			loop
			onOpenAutoFocus={async (event) => {
				if (!openFromEnd) return;
				openFromEnd = false;
				event.preventDefault();
				await tick();
				if (!open) return;
				const items = menuElement?.querySelectorAll<HTMLElement>(
					'[role^="menuitem"]:not([data-disabled])'
				);
				items?.item(items.length - 1)?.focus();
			}}
		>
			{@render children()}
		</DropdownMenu.Content>
	</DropdownMenu.Portal>
</DropdownMenu.Root>

<style>
	.sh-action-menu {
		display: inline-flex;
	}
	:global(.sh-action-menu-content) {
		z-index: 50;
		min-width: var(--sh-menu-min-width);
		max-width: var(--bits-dropdown-menu-content-available-width);
		max-height: var(--bits-dropdown-menu-content-available-height);
		overflow-y: auto;
		padding: var(--nais-space-4);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-lg);
	}
</style>
