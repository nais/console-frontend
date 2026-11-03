<script lang="ts" module>
	import { getContext, hasContext } from 'svelte';

	export interface ActionMenuContext {
		close(): void;
	}

	const contextKey = Symbol('ActionMenuContext');

	export function GetActionMenuContext(): ActionMenuContext | undefined {
		if (!hasContext(contextKey)) return undefined;
		return getContext<ActionMenuContext>(contextKey);
	}
</script>

<script lang="ts">
	import { setContext, tick, type Snippet } from 'svelte';
	import { focusGroupItem } from './keyboardNavigation.js';

	interface Props {
		open?: boolean;
		children: Snippet;
		trigger: Snippet<[Record<string, unknown>]>;
		[key: string]: unknown;
	}

	let { open = $bindable(false), children, trigger }: Props = $props();
	let container: HTMLDivElement;
	let menu = $state<HTMLDivElement>();
	let triggerElement: HTMLElement | undefined;

	function close(restoreFocus = true) {
		open = false;
		if (restoreFocus) triggerElement?.focus();
	}

	async function openMenu(last = false) {
		open = true;
		await tick();
		if (!open || !menu) return;
		const items = menu.querySelectorAll<HTMLElement>(
			'[role^="menuitem"]:not([disabled]):not([aria-disabled="true"])'
		);
		(last ? items[items.length - 1] : items[0])?.focus();
	}

	const ctx: ActionMenuContext = {
		close() {
			close();
		}
	};

	setContext(contextKey, ctx);

	let triggerProps = $derived({
		'aria-haspopup': 'menu',
		'aria-expanded': open,
		onclick: (e: MouseEvent) => {
			e.stopPropagation();
			triggerElement = e.currentTarget instanceof HTMLElement ? e.currentTarget : undefined;
			if (open) close();
			else void openMenu();
		},
		onkeydown: (e: KeyboardEvent) => {
			if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
				e.preventDefault();
				triggerElement = e.currentTarget instanceof HTMLElement ? e.currentTarget : undefined;
				void openMenu(e.key === 'ArrowUp');
			}
		}
	});
</script>

<svelte:window
	onclick={(event) => {
		if (open && event.target instanceof Node && !container.contains(event.target)) close(false);
	}}
	onkeydown={(e) => {
		if (open && e.key === 'Escape') {
			e.preventDefault();
			close();
		}
		if (open && e.key === 'Tab') close(false);
	}}
/>

<div class="sh-action-menu" bind:this={container}>
	{@render trigger(triggerProps)}
	{#if open}
		<div
			role="menu"
			bind:this={menu}
			tabindex="-1"
			class="sh-action-menu-content"
			onclick={(e) => e.stopPropagation()}
			onkeydown={(event) =>
				focusGroupItem(event, event.currentTarget, '[role^="menuitem"]', 'vertical')}
		>
			{@render children()}
		</div>
	{/if}
</div>

<style>
	.sh-action-menu {
		position: relative;
		display: inline-flex;
	}
	.sh-action-menu-content {
		position: absolute;
		top: calc(100% + var(--ax-space-6));
		right: 0;
		z-index: 50;
		min-width: var(--sh-menu-min-width);
		padding: var(--ax-space-4);
		border: var(--sh-border-width) solid var(--border);
		border-radius: var(--radius);
		background-color: var(--popover);
		color: var(--popover-foreground);
		box-shadow: var(--sh-shadow-lg);
	}
</style>
